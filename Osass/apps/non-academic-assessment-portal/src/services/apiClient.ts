import { ApiClient, type ApiClientOptions, type RequestInterceptor } from "@osass/api-client";


const resolveApiUrl = (value: string | undefined, devFallback: string, name: string): string => {
    if (value) return value;
    if (import.meta.env.PROD) {
        throw new Error(`${name} is not configured. Set it at build time.`);
    }
    return devFallback;
};

const IDENTITY_API_URL = resolveApiUrl(import.meta.env.VITE_IDENTITY_API_URL, "http://localhost:5001/api/v1", "VITE_IDENTITY_API_URL");
const NON_ACADEMIC_API_URL = resolveApiUrl(import.meta.env.VITE_NON_ACADEMIC_API_URL, "http://localhost:5006/api/v1", "VITE_NON_ACADEMIC_API_URL");

const clientOptions: ApiClientOptions = {
  shouldRefresh: path => !path.toLowerCase().startsWith("/staffs/login"),
  refreshAccessToken: () => refreshAccessToken(),
  fillCode: true,
};

export const identityClient = new ApiClient(IDENTITY_API_URL, clientOptions);
export const academicClient = new ApiClient(NON_ACADEMIC_API_URL, clientOptions);

// Auth interceptor: Add token to requests
const authInterceptor: RequestInterceptor = (config) => {
    const token = localStorage.getItem("osass_assessment_token");
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

const performRefresh = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("osass_assessment_refresh_token");
    const accessToken = localStorage.getItem("osass_assessment_token");

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
                localStorage.setItem("osass_assessment_token", data.data.accessToken);
                if (data.data.refreshToken) {
                    localStorage.setItem("osass_assessment_refresh_token", data.data.refreshToken);
                }
                return data.data.accessToken;
            }
        } else if (refreshResponse.status !== 401 && refreshResponse.status !== 403) {
            // Server-side/transient failure: keep the session, let the caller see the original error.
            return null;
        }
    } catch (error) {
        // Network failure: do not treat as an invalid session.
        console.error("Token refresh error:", error);
        return null;
    }

    // Refresh token rejected - the session is no longer valid
    localStorage.removeItem("osass_assessment_token");
    localStorage.removeItem("osass_assessment_refresh_token");
    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
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
