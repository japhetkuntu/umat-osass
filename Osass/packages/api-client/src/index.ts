import type { ApiResponse } from "@osass/domain";
export type { ApiResponse, PagedResult } from "@osass/domain";

export type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

export interface ApiClientOptions {
  shouldRefresh?: (path: string) => boolean;
  refreshAccessToken?: () => Promise<string | null>;
  onRetryUnauthorized?: () => void;
  reapplyRequestInterceptorsOnRetry?: boolean;
  interceptResponseBeforeRefresh?: boolean;
  catchRequestInterceptorErrors?: boolean;
  includeStatus?: boolean;
  fillCode?: boolean;
  appendValidationErrors?: boolean;
  requestTimeoutMs?: number;
  uploadTimeoutMs?: number;
  rethrowCallerAbort?: boolean;
  networkError?: { code: number; status?: number; message: string };
  timeoutMessage?: string;
}

export class ApiClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(private baseUrl: string, private options: ApiClientOptions = {}) {}

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  private async applyRequestInterceptors(config: RequestInit): Promise<RequestInit> {
    let currentConfig = { ...config };
    for (const interceptor of this.requestInterceptors) currentConfig = await interceptor(currentConfig);
    return currentConfig;
  }

  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let currentResponse = response;
    for (const interceptor of this.responseInterceptors) currentResponse = await interceptor(currentResponse);
    return currentResponse;
  }

  async request<T>(path: string, config: RequestInit = {}, isRetry = false): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(config.headers);
    if (!headers.has("Content-Type") && !(config.body instanceof FormData)) headers.set("Content-Type", "application/json");
    const callerSignal = config.signal;
    const timeoutMs = config.body instanceof FormData ? this.options.uploadTimeoutMs : this.options.requestTimeoutMs;
    const controller = timeoutMs === undefined ? undefined : new AbortController();
    let timedOut = false;
    const onCallerAbort = () => controller?.abort();
    if (controller && callerSignal) {
      if (callerSignal.aborted) controller.abort();
      else callerSignal.addEventListener("abort", onCallerAbort, { once: true });
    }
    const initialConfig = { ...config, headers, ...(controller ? { signal: controller.signal } : {}) };
    const timer = controller ? setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs) : undefined;
    let interceptedConfig = initialConfig as RequestInit;

    const execute = async () => {
      if (this.options.catchRequestInterceptorErrors) interceptedConfig = await this.applyRequestInterceptors(initialConfig);
      let response = await fetch(url, interceptedConfig);
      if (this.options.interceptResponseBeforeRefresh) response = await this.applyResponseInterceptors(response);

      if (response.status === 401 && !isRetry && (this.options.shouldRefresh?.(path) ?? true)) {
        const newToken = await this.options.refreshAccessToken?.();
        if (newToken) {
          const retryHeaders = new Headers(interceptedConfig.headers);
          retryHeaders.set("Authorization", `Bearer ${newToken}`);
          interceptedConfig = this.options.reapplyRequestInterceptorsOnRetry
            ? await this.applyRequestInterceptors({ ...initialConfig, headers: retryHeaders })
            : { ...interceptedConfig, headers: retryHeaders };
          response = await fetch(url, interceptedConfig);
          if (this.options.interceptResponseBeforeRefresh) response = await this.applyResponseInterceptors(response);
          if (response.status === 401) this.options.onRetryUnauthorized?.();
        }
      } else if (response.status === 401 && isRetry) this.options.onRetryUnauthorized?.();

      if (!this.options.interceptResponseBeforeRefresh) response = await this.applyResponseInterceptors(response);
      const text = await response.text();
      let result: Record<string, unknown>;
      try {
        const parsed: unknown = text ? JSON.parse(text) : {};
        result = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : { message: String(parsed) };
      } catch {
        result = { message: text || "Empty response" };
      }
      const code = typeof result.code === "number" ? result.code : undefined;
      const isSuccess = response.ok || (code !== undefined && code >= 200 && code < 300);
      if (this.options.appendValidationErrors && !isSuccess && Array.isArray(result.errors)) {
        const details = result.errors.map(error => error?.errorMessage).filter(Boolean).join(" ");
        if (details) result.message = result.message ? `${result.message}: ${details}` : details;
      }
      return {
        ...result,
        ...(this.options.fillCode ? { code: result.code ?? response.status } : {}),
        ...(this.options.includeStatus ? { status: response.status } : {}),
        success: result.success ?? isSuccess,
      } as ApiResponse<T>;
    };

    try {
      if (!this.options.catchRequestInterceptorErrors) interceptedConfig = await this.applyRequestInterceptors(initialConfig);
      try {
        return await execute();
      } catch (error) {
        if (this.options.rethrowCallerAbort && callerSignal?.aborted) throw error;
        console.error(`API Error [${url}]:`, error);
        const failure = this.options.networkError ?? { code: 500, message: "An unexpected error occurred." };
        return { ...failure, message: timedOut ? this.options.timeoutMessage ?? "The request timed out. Please try again." : failure.message, data: null as T, success: false };
      }
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      callerSignal?.removeEventListener("abort", onCallerAbort);
    }
  }

  get<T>(path: string, config: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "GET" });
  }

  post<T>(path: string, body?: unknown, config: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) });
  }

  put<T>(path: string, body?: unknown, config: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) });
  }

  delete<T>(path: string, config: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: "DELETE" });
  }
}
