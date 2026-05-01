import { ApiResponse } from "../types/auth";

type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

class ApiClient {
    private requestInterceptors: RequestInterceptor[] = [];
    private responseInterceptors: ResponseInterceptor[] = [];

    constructor(private baseUrl: string) { }

    addRequestInterceptor(interceptor: RequestInterceptor) {
        this.requestInterceptors.push(interceptor);
    }

    addResponseInterceptor(interceptor: ResponseInterceptor) {
        this.responseInterceptors.push(interceptor);
    }

    private async applyRequestInterceptors(config: RequestInit): Promise<RequestInit> {
        let currentConfig = { ...config };
        for (const interceptor of this.requestInterceptors) {
            currentConfig = await interceptor(currentConfig);
        }
        return currentConfig;
    }

    private async applyResponseInterceptors(response: Response): Promise<Response> {
        let currentResponse = response;
        for (const interceptor of this.responseInterceptors) {
            currentResponse = await interceptor(currentResponse);
        }
        return currentResponse;
    }

    async request<T>(path: string, config: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${path}`;

        // Default headers
        const headers = new Headers(config.headers);
        if (!headers.has("Content-Type") && !(config.body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
        }

        let interceptedConfig = await this.applyRequestInterceptors({
            ...config,
            headers,
        });

        try {
            let response = await fetch(url, interceptedConfig);
            response = await this.applyResponseInterceptors(response);

            const text = await response.text();
            let result: any = {};
            try {
                result = text ? JSON.parse(text) : {};
            } catch (e) {
                console.warn("Failed to parse API response as JSON:", text);
                result = { message: text || "Empty response" };
            }

            // Intercepting success based on HTTP code if success property is missing
            const isSuccess = response.ok || (result.code >= 200 && result.code < 300);

            return {
                ...result,
                success: result.success ?? isSuccess,
            };
        } catch (error) {
            console.error(`API Error [${url}]:`, error);
            return {
                code: 500,
                message: "An unexpected error occurred.",
                data: null as any,
                success: false,
            };
        }
    }

    async get<T>(path: string, config: RequestInit = {}): Promise<ApiResponse<T>> {
        return this.request<T>(path, { ...config, method: "GET" });
    }

    async post<T>(path: string, body?: any, config: RequestInit = {}): Promise<ApiResponse<T>> {
        return this.request<T>(path, {
            ...config,
            method: "POST",
            body: body instanceof FormData ? body : JSON.stringify(body),
        });
    }

    async put<T>(path: string, body?: any, config: RequestInit = {}): Promise<ApiResponse<T>> {
        return this.request<T>(path, {
            ...config,
            method: "PUT",
            body: body instanceof FormData ? body : JSON.stringify(body),
        });
    }

    async delete<T>(path: string, config: RequestInit = {}): Promise<ApiResponse<T>> {
        return this.request<T>(path, { ...config, method: "DELETE" });
    }
}

const IDENTITY_API_URL = import.meta.env.VITE_IDENTITY_API_URL || "http://localhost:5001/api/v1";
const NON_ACADEMIC_API_URL = import.meta.env.VITE_NON_ACADEMIC_API_URL || "http://localhost:5006/api/v1";

export const identityClient = new ApiClient(IDENTITY_API_URL);
export const nonAcademicClient = new ApiClient(NON_ACADEMIC_API_URL);

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

// Standard Response Interceptor: Handle 401 Unauthorized with token refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const unauthorizedInterceptor: ResponseInterceptor = async (response) => {
    if (response.status === 401) {
        const refreshToken = localStorage.getItem("osass_refresh_token");
        const accessToken = localStorage.getItem("osass_token");

        if (refreshToken && accessToken && !isRefreshing) {
            isRefreshing = true;

            try {
                // Attempt to refresh the token
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
                        onRefreshed(data.data.accessToken);
                        isRefreshing = false;
                        return response;
                    }
                }
            } catch (error) {
                console.error("Token refresh failed:", error);
            }

            // Refresh failed - logout user
            isRefreshing = false;
            localStorage.removeItem("osass_token");
            localStorage.removeItem("osass_refresh_token");
            window.location.href = "/login";
        } else if (refreshToken && !isRefreshing) {
            // Already refreshing or no token, queue the request
            return new Promise(resolve => {
                addRefreshSubscriber((token: string) => {
                    const headers = new Headers(response.headers);
                    headers.set("Authorization", `Bearer ${token}`);
                    resolve(response);
                });
            });
        }
    }
    return response;
};

identityClient.addResponseInterceptor(unauthorizedInterceptor);
nonAcademicClient.addResponseInterceptor(unauthorizedInterceptor);
