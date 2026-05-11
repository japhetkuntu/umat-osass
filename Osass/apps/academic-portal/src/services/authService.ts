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

    async forgotPassword(email: string): Promise<ApiResponse<{ email: string; uniqueId: string }>> {
        return await identityClient.get<{ email: string; uniqueId: string }>(`/Staffs/reset-password/${encodeURIComponent(email)}`);
    }

    async resetPassword(uniqueId: string, otpCode: string, password: string): Promise<ApiResponse<StaffTokenResponse>> {
        return await identityClient.post<StaffTokenResponse>("/Staffs/reset-password", {
            uniqueId,
            otpCode,
            password,
            confirmPassword: password,
        });
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<StaffTokenResponse>> {
        return await identityClient.post<StaffTokenResponse>("/Staffs/change-password", {
            currentPassword,
            newPassword,
            confirmNewPassword: newPassword,
        });
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
