type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

export interface PagedResult<T> {
  results: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  count: number;
  totalPages: number;
  lowerBoundSize: number;
  upperBoundSize: number;
}

class ApiClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(private baseUrl: string) {}

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

    const headers = new Headers(config.headers);
    if (!headers.has("Content-Type") && !(config.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const interceptedConfig = await this.applyRequestInterceptors({
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
      } catch {
        result = { message: text || "Empty response" };
      }

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
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || "http://localhost:5003/api/v1";

export const identityClient = new ApiClient(IDENTITY_API_URL);
export const adminClient = new ApiClient(ADMIN_API_URL);

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

// 401 interceptor: refresh token or redirect to login
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const unauthorizedInterceptor: ResponseInterceptor = async (response) => {
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("admin_refresh_token");
    const accessToken = localStorage.getItem("admin_token");

    if (refreshToken && accessToken && !isRefreshing) {
      isRefreshing = true;
      try {
        const res = await fetch(`${IDENTITY_API_URL}/Admins/refreshtoken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.data?.accessToken) {
            localStorage.setItem("admin_token", data.data.accessToken);
            if (data.data.refreshToken) {
              localStorage.setItem("admin_refresh_token", data.data.refreshToken);
            }
            onRefreshed(data.data.accessToken);
            isRefreshing = false;
            return response;
          }
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }

      isRefreshing = false;
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.href = "/login";
    }
  }
  return response;
};

identityClient.addResponseInterceptor(unauthorizedInterceptor);
adminClient.addResponseInterceptor(unauthorizedInterceptor);
