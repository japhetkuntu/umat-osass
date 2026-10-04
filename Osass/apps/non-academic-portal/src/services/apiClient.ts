import { ApiClient, type ApiClientOptions, type RequestInterceptor } from "@osass/api-client";


const IDENTITY_API_URL = import.meta.env.VITE_IDENTITY_API_URL || "http://localhost:5001/api/v1";
const NON_ACADEMIC_API_URL = import.meta.env.VITE_NON_ACADEMIC_API_URL || "http://localhost:5006/api/v1";

const clientOptions: ApiClientOptions = {
  refreshAccessToken: () => refreshAccessToken(),
};

export const identityClient = new ApiClient(IDENTITY_API_URL, clientOptions);
export const nonAcademicClient = new ApiClient(NON_ACADEMIC_API_URL, clientOptions);

// Standard Request Interceptor: Add Auth Token
const authInterceptor: RequestInterceptor = (config) => {
    const token = localStorage.getItem("osass_token");
    if (token) {
        const headers = new Headers(config.headers);
        headers.set("Authorization", `Bearer ${token}`);
        return { ...config, headers };
    }
    return config;
};

identityClient.addRequestInterceptor(authInterceptor);
nonAcademicClient.addRequestInterceptor(authInterceptor);

// Token refresh: shared across both clients so a 401 from either API triggers
// at most one in-flight refresh call, and every request waiting on it is
// retried with the new token once the refresh resolves (see request() above).
let refreshPromise: Promise<string | null> | null = null;

const performRefresh = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("osass_refresh_token");
    const accessToken = localStorage.getItem("osass_token");

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
                localStorage.setItem("osass_token", data.data.accessToken);
                if (data.data.refreshToken) {
                    localStorage.setItem("osass_refresh_token", data.data.refreshToken);
                }
                return data.data.accessToken;
            }
        }
    } catch (error) {
        console.error("Token refresh failed:", error);
    }

    // Refresh failed - logout user
    localStorage.removeItem("osass_token");
    localStorage.removeItem("osass_refresh_token");
    window.location.href = "/login";
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
