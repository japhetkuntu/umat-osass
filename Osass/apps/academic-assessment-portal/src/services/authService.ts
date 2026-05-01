import { ApiResponse, LoginResponse, StaffLoginMetaData } from "../types/assessment";
import { identityClient, academicClient } from "./apiClient";

class AuthService {
    async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
        const result = await identityClient.post<LoginResponse>("/Staffs/login", { email, password });

        if (result.success && result.data?.accessToken) {
            localStorage.setItem("osass_assessment_token", result.data.accessToken);
            if (result.data.refreshToken) {
                localStorage.setItem("osass_assessment_refresh_token", result.data.refreshToken);
            }
        }
        return result;
    }

    async getProfile(): Promise<ApiResponse<StaffLoginMetaData>> {
        return await identityClient.get<StaffLoginMetaData>("/Staffs/me");
    }

    async refreshToken(accessToken: string, refreshToken: string): Promise<ApiResponse<LoginResponse>> {
        const result = await identityClient.post<LoginResponse>("/Staffs/refreshtoken", {
            accessToken,
            refreshToken
        });

        if (result.success && result.data?.accessToken) {
            localStorage.setItem("osass_assessment_token", result.data.accessToken);
            if (result.data.refreshToken) {
                localStorage.setItem("osass_assessment_refresh_token", result.data.refreshToken);
            }
        }
        return result;
    }

    logout() {
        localStorage.removeItem("osass_assessment_token");
        localStorage.removeItem("osass_assessment_refresh_token");
    }

    getToken(): string | null {
        return localStorage.getItem("osass_assessment_token");
    }

    getRefreshToken(): string | null {
        return localStorage.getItem("osass_assessment_refresh_token");
    }
}

export const authService = new AuthService();
