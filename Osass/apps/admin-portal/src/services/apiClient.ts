export type { ApiResponse, PagedResult } from "@osass/domain";
import { ApiClient, type ApiClientOptions, type RequestInterceptor } from "@osass/api-client";

export const AUTH_EXPIRED_EVENT = "admin:auth-expired";

const IDENTITY_API_URL = import.meta.env.VITE_IDENTITY_API_URL || "http://localhost:5001/api/v1";
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || "http://localhost:5003/api/v1";

const isAuthPath = (path: string) => /^\/Admins\/(login|refreshtoken|reset-password)/i.test(path);

// A single in-flight refresh is shared by every request that hits a 401 while it is running.
let refreshPromise: Promise<"ok" | "rejected" | "error"> | null = null;

const expireSession = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_refresh_token");
  localStorage.removeItem("admin_user");
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
};

const refreshAccessToken = (): Promise<"ok" | "rejected" | "error"> => {
  if (refreshPromise) return refreshPromise;

  const accessToken = localStorage.getItem("admin_token");
  const refreshToken = localStorage.getItem("admin_refresh_token");
  if (!accessToken || !refreshToken) return Promise.resolve("rejected");

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${IDENTITY_API_URL}/Admins/refreshtoken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ accessToken, refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.accessToken) {
          localStorage.setItem("admin_token", data.data.accessToken);
          if (data.data.refreshToken) {
            localStorage.setItem("admin_refresh_token", data.data.refreshToken);
          }
          return "ok" as const;
        }
        return "rejected" as const;
      }
      return res.status >= 400 && res.status < 500 ? ("rejected" as const) : ("error" as const);
    } catch {
      return "error" as const;
    } finally {
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();

  return refreshPromise;
};

const clientOptions: ApiClientOptions = {
  shouldRefresh: path => !isAuthPath(path),
  refreshAccessToken: async () => {
    const outcome = await refreshAccessToken();
    if (outcome === "rejected") expireSession();
    return outcome === "ok" ? localStorage.getItem("admin_token") : null;
  },
  onRetryUnauthorized: expireSession,
  reapplyRequestInterceptorsOnRetry: true,
  interceptResponseBeforeRefresh: true,
  includeStatus: true,
  networkError: { code: 500, status: 0, message: "Unable to reach the server. Check your connection and try again." },
};

export const identityClient = new ApiClient(IDENTITY_API_URL, clientOptions);
export const adminClient = new ApiClient(ADMIN_API_URL, clientOptions);

// Auth interceptor: attach Bearer token
const authInterceptor: RequestInterceptor = (config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    const headers = new Headers(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return { ...config, headers };
  }
  return config;
};

identityClient.addRequestInterceptor(authInterceptor);
adminClient.addRequestInterceptor(authInterceptor);
