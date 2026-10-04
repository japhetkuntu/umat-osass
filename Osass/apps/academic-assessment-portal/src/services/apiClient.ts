import { ApiClient, type ApiClientOptions, type RequestInterceptor } from "@osass/api-client";


const TOKEN_KEY = "osass_assessment_token";
const REFRESH_TOKEN_KEY = "osass_assessment_refresh_token";

const REQUEST_TIMEOUT_MS = 30_000;
const UPLOAD_TIMEOUT_MS = 120_000;

// Paths whose 401 means "bad credentials" or "refresh rejected", never "token expired".
const AUTH_PATH_PATTERN = /\/(login|refreshtoken)/i;

type AuthExpiredHandler = () => void;
let authExpiredHandler: AuthExpiredHandler | null = null;

/** Registers the callback invoked when the session can no longer be refreshed. Returns an unsubscribe function. */
export const setAuthExpiredHandler = (handler: AuthExpiredHandler | null) => {
    authExpiredHandler = handler;
    return () => {
        if (authExpiredHandler === handler) authExpiredHandler = null;
    };
};

const resolveApiUrl = (value: string | undefined, devFallback: string, envName: string): string => {
    if (value) return value;
    if (!import.meta.env.DEV) {
        console.error(`${envName} is not configured for this build; API calls will fail. Set it at build time.`);
    }
    return devFallback;
};

const IDENTITY_API_URL = resolveApiUrl(import.meta.env.VITE_IDENTITY_API_URL, "http://localhost:5001/api/v1", "VITE_IDENTITY_API_URL");
const ACADEMIC_API_URL = resolveApiUrl(import.meta.env.VITE_ACADEMIC_API_URL, "http://localhost:5004/api/v1", "VITE_ACADEMIC_API_URL");

const clientOptions: ApiClientOptions = {
  shouldRefresh: path => !AUTH_PATH_PATTERN.test(path),
  refreshAccessToken: () => refreshAccessToken(),
  catchRequestInterceptorErrors: true,
  includeStatus: true,
  fillCode: true,
  appendValidationErrors: true,
  requestTimeoutMs: REQUEST_TIMEOUT_MS,
  uploadTimeoutMs: UPLOAD_TIMEOUT_MS,
  rethrowCallerAbort: true,
  networkError: { code: 0, status: 0, message: "Unable to reach the server. Please check your connection and try again." },
  timeoutMessage: "The request timed out. Please check your connection and try again.",
};

export const identityClient = new ApiClient(IDENTITY_API_URL, clientOptions);
export const academicClient = new ApiClient(ACADEMIC_API_URL, clientOptions);

// Standard Request Interceptor: Add Auth Token
const authInterceptor: RequestInterceptor = (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        const headers = new Headers(config.headers);
        headers.set("Authorization", `Bearer ${token}`);
        return { ...config, headers };
    }
    return config;
};

identityClient.addRequestInterceptor(authInterceptor);
academicClient.addRequestInterceptor(authInterceptor);

// Token refresh: shared across both clients so a 401 from either API triggers
// at most one in-flight refresh call, and every request waiting on it is
// retried with the new token once the refresh resolves (see request() above).
let refreshPromise: Promise<string | null> | null = null;

const expireSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    if (authExpiredHandler) {
        authExpiredHandler();
    } else if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
};

const performRefresh = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const accessToken = localStorage.getItem(TOKEN_KEY);

    if (!refreshToken || !accessToken) {
        return null;
    }

    try {
        const refreshResponse = await fetch(`${IDENTITY_API_URL}/Staffs/refreshtoken`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, refreshToken })
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            if (data.success && data.data?.accessToken) {
                localStorage.setItem(TOKEN_KEY, data.data.accessToken);
                if (data.data.refreshToken) {
                    localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken);
                }
                return data.data.accessToken;
            }
        }

        // Only an explicit rejection of the refresh token ends the session;
        // 5xx responses and network errors must not log the user out.
        if (refreshResponse.status === 401 || refreshResponse.status === 403) {
            expireSession();
        }
    } catch (error) {
        console.error("Token refresh failed:", error);
    }

    return null;
};

const refreshAccessToken = (): Promise<string | null> => {
    if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
};
