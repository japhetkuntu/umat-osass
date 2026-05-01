import { ApiResponse, LoginResponse, StaffLoginMetaData, StaffTokenResponse } from "../types/auth";
import { identityClient, academicClient } from "./apiClient";

class AuthService {
    async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
        const result = await identityClient.post<LoginResponse>("/Staffs/login/academic", { email, password });

        if (result.success && result.data?.accessToken) {
            localStorage.setItem("osass_token", result.data.accessToken);
            if (result.data.refreshToken) {
                localStorage.setItem("osass_refresh_token", result.data.refreshToken);
            }
        }
        return result;
    }

    async getProfile(): Promise<ApiResponse<StaffTokenResponse>> {
        return await identityClient.get<StaffTokenResponse>("/Staffs/me");
    }

    async getEligibility(): Promise<ApiResponse<any>> {
        return await academicClient.get<any>("/Applications/eligibility");
    }

    async refreshToken(accessToken: string, refreshToken: string): Promise<ApiResponse<LoginResponse>> {
        const result = await identityClient.post<LoginResponse>("/Staffs/refreshtoken", {
            accessToken,
            refreshToken
        });

        if (result.success && result.data?.accessToken) {
            localStorage.setItem("osass_token", result.data.accessToken);
            if (result.data.refreshToken) {
                localStorage.setItem("osass_refresh_token", result.data.refreshToken);
            }
        }
        return result;
    }

    logout() {
        localStorage.removeItem("osass_token");
        localStorage.removeItem("osass_refresh_token");
    }

    getToken(): string | null {
        return localStorage.getItem("osass_token");
    }

    getRefreshToken(): string | null {
        return localStorage.getItem("osass_refresh_token");
    }
}

export const authService = new AuthService();
