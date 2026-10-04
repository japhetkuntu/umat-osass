import { ApiClient } from "@osass/api-client";
import { identityClient, academicClient, setAuthExpiredHandler } from "@/services/apiClient";
import * as assessment from "../../../academic-assessment-portal/src/services/apiClient";
import * as admin from "../../../admin-portal/src/services/apiClient";
import * as nonAcademic from "../../../non-academic-portal/src/services/apiClient";
import * as nonAcademicAssessment from "../../../non-academic-assessment-portal/src/services/apiClient";

const profiles = [
  { name: "academic", client: academicClient, errorCode: 0, errorStatus: 0, fillsCode: true, includesStatus: true },
  { name: "academic assessment", client: assessment.academicClient, errorCode: 0, errorStatus: 0, fillsCode: true, includesStatus: true },
  { name: "admin", client: admin.adminClient, errorCode: 500, errorStatus: 0, fillsCode: false, includesStatus: true },
  { name: "non-academic", client: nonAcademic.nonAcademicClient, errorCode: 500, errorStatus: undefined, fillsCode: false, includesStatus: false },
  { name: "non-academic assessment", client: nonAcademicAssessment.academicClient, errorCode: 500, errorStatus: undefined, fillsCode: true, includesStatus: false },
];

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("shared API client and portal policies", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    setAuthExpiredHandler(null);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it.each(profiles)("preserves $name network failure semantics", async profile => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const result = await profile.client.get("/records");
    expect(result.success).toBe(false);
    expect(result.code).toBe(profile.errorCode);
    expect(result.status).toBe(profile.errorStatus);
    expect(result.data).toBeNull();
  });

  it.each(profiles)("preserves $name HTTP fallback and explicit failure envelopes", async profile => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ message: "Invalid" }, 400))
      .mockResolvedValueOnce(jsonResponse({ code: 200, success: false, message: "Rejected" }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await profile.client.get("/records");
    expect(result.success).toBe(false);
    expect(result.code).toBe(profile.fillsCode ? 400 : undefined);
    expect(result.status).toBe(profile.includesStatus ? 400 : undefined);
    expect((await profile.client.get("/records")).success).toBe(false);
  });

  it("preserves async interceptor order and multipart request bodies", async () => {
    const order: string[] = [];
    const client = new ApiClient("https://example.test");
    client.addRequestInterceptor(async config => {
      order.push("request one");
      return config;
    });
    client.addRequestInterceptor(config => { order.push("request two"); return config; });
    client.addResponseInterceptor(async response => { order.push("response one"); return response; });
    client.addResponseInterceptor(response => { order.push("response two"); return response; });
    const fetchMock = vi.fn().mockImplementation(async () => { order.push("fetch"); return jsonResponse({ success: true }); });
    vi.stubGlobal("fetch", fetchMock);
    const body = new FormData();
    body.append("Evidence", new File(["evidence"], "paper.pdf"));
    await client.post("/upload", body);
    expect(order).toEqual(["request one", "request two", "fetch", "response one", "response two"]);
    const config = fetchMock.mock.calls[0][1] as RequestInit;
    expect(config.body).toBe(body);
    expect(new Headers(config.headers).has("Content-Type")).toBe(false);
  });

  it("includes backend validation details in academic failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ message: "Invalid password", errors: [{ errorMessage: "Use 12–72 characters" }] }, 400)));
    expect((await academicClient.get("/records")).message).toBe("Invalid password: Use 12–72 characters");
  });

  it("shares one refresh across academic identity and promotion requests", async () => {
    localStorage.setItem("osass_token", "old");
    localStorage.setItem("osass_refresh_token", "refresh");
    let completeRefresh: (response: Response) => void;
    const refresh = new Promise<Response>(resolve => { completeRefresh = resolve; });
    const fetchMock = vi.fn((url: string, config: RequestInit) => {
      if (url.endsWith("/Staffs/refreshtoken")) return refresh;
      return Promise.resolve(new Headers(config.headers).get("Authorization") === "Bearer new"
        ? jsonResponse({ success: true, data: "ready" })
        : jsonResponse({ success: false }, 401));
    });
    vi.stubGlobal("fetch", fetchMock);
    const pending = [identityClient.get("/profile"), academicClient.get("/records")];
    await vi.waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url.endsWith("/Staffs/refreshtoken"))).toHaveLength(1));
    completeRefresh(jsonResponse({ success: true, data: { accessToken: "new", refreshToken: "new-refresh" } }));
    expect((await Promise.all(pending)).every(result => result.success)).toBe(true);
    expect(localStorage.getItem("osass_refresh_token")).toBe("new-refresh");
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("does not refresh on a login rejection", async () => {
    localStorage.setItem("osass_token", "old");
    localStorage.setItem("osass_refresh_token", "refresh");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: false }, 401));
    vi.stubGlobal("fetch", fetchMock);
    await identityClient.post("/Staffs/login/academic", { email: "test@example.test", password: "legacy" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("osass_token")).toBe("old");
  });

  it.each([503, 403])("preserves academic session handling on refresh HTTP %s", async status => {
    localStorage.setItem("osass_token", "old");
    localStorage.setItem("osass_refresh_token", "refresh");
    const expired = vi.fn();
    setAuthExpiredHandler(expired);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(jsonResponse({}, 401)).mockResolvedValueOnce(jsonResponse({}, status)));
    await academicClient.get("/records");
    expect(expired).toHaveBeenCalledTimes(status === 403 ? 1 : 0);
    expect(localStorage.getItem("osass_token")).toBe(status === 403 ? null : "old");
  });

  it("expires an admin session if its retried request is still unauthorized", async () => {
    localStorage.setItem("admin_token", "old");
    localStorage.setItem("admin_refresh_token", "refresh");
    const expired = vi.fn();
    window.addEventListener(admin.AUTH_EXPIRED_EVENT, expired);
    try {
      const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({}, 401))
        .mockResolvedValueOnce(jsonResponse({ data: { accessToken: "new" } }))
        .mockResolvedValueOnce(jsonResponse({}, 401));
      vi.stubGlobal("fetch", fetchMock);
      await admin.adminClient.get("/records");
      expect(expired).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem("admin_token")).toBeNull();
      expect(new Headers(fetchMock.mock.calls[2][1].headers).get("Authorization")).toBe("Bearer new");
    } finally {
      window.removeEventListener(admin.AUTH_EXPIRED_EVENT, expired);
    }
  });

  it("returns a timeout envelope and propagates caller cancellation", async () => {
    vi.useFakeTimers();
    const client = new ApiClient("https://example.test", { requestTimeoutMs: 30, uploadTimeoutMs: 120, rethrowCallerAbort: true, catchRequestInterceptorErrors: true });
    vi.stubGlobal("fetch", vi.fn((_url, config: RequestInit) => new Promise((_resolve, reject) => {
      config.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
    })));
    const timeout = client.get("/records");
    await vi.advanceTimersByTimeAsync(30);
    expect((await timeout).message).toContain("timed out");
    const controller = new AbortController();
    const cancelled = client.get("/records", { signal: controller.signal });
    const assertion = expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
});
