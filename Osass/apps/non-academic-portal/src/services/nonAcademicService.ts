import { ApiResponse } from "../types/auth";
import {
    ApplicationCategoryState,
    ApplicationDocuments,
    KnowledgeMaterialIndicator,
    PerformanceAtWorkResponse,
    KnowledgeProfessionResponse,
    NonAcademicServiceResponse,
    ServicePositionIndicator,
    OverallReview,
    HistoricalApplication,
    StaffUpdateItem,
    PagedResult,
} from "../types/academic";
import { PromotionLetterData } from "../types/promotionLetter";
import { EligibilityForecastResponse } from "../types/forecast";
import { nonAcademicClient } from "./apiClient";

class NonAcademicService {
    async getApplicationCategoryState(): Promise<ApiResponse<ApplicationCategoryState>> {
        return await nonAcademicClient.get<ApplicationCategoryState>("/Applications/category-state");
    }

    async getOverallReview(): Promise<ApiResponse<OverallReview>> {
        return await nonAcademicClient.get<OverallReview>("/Applications/overall-review");
    }

    async getPerformanceAtWorkState(): Promise<ApiResponse<PerformanceAtWorkResponse>> {
        return await nonAcademicClient.get<PerformanceAtWorkResponse>("/PerformanceAtWork");
    }

    async getKnowledgeProfessionState(): Promise<ApiResponse<KnowledgeProfessionResponse>> {
        return await nonAcademicClient.get<KnowledgeProfessionResponse>("/KnowledgeProfession");
    }

    async getKnowledgeMaterialIndicators(): Promise<ApiResponse<KnowledgeMaterialIndicator[]>> {
        return await nonAcademicClient.get<KnowledgeMaterialIndicator[]>("/KnowledgeProfession/indicators");
    }

    async getServiceState(): Promise<ApiResponse<NonAcademicServiceResponse>> {
        return await nonAcademicClient.get<NonAcademicServiceResponse>("/NonAcademicService");
    }

    async getServicePositions(): Promise<ApiResponse<ServicePositionIndicator[]>> {
        return await nonAcademicClient.get<ServicePositionIndicator[]>("/NonAcademicService/positions");
    }

    async updatePerformanceAtWork(data: FormData): Promise<ApiResponse<any>> {
        return await nonAcademicClient.post<any>("/PerformanceAtWork", data);
    }

    async updateKnowledgeProfession(data: FormData): Promise<ApiResponse<any>> {
        return await nonAcademicClient.post<any>("/KnowledgeProfession", data);
    }

    async updateService(data: FormData): Promise<ApiResponse<any>> {
        return await nonAcademicClient.post<any>("/NonAcademicService", data);
    }

    async submitApplication(): Promise<ApiResponse<boolean>> {
        return await nonAcademicClient.post<boolean>("/Applications/submit");
    }

    async getApplicationDocuments(): Promise<ApiResponse<ApplicationDocuments>> {
        return await nonAcademicClient.get<ApplicationDocuments>("/Applications/documents");
    }

    async uploadApplicationDocuments(data: FormData): Promise<ApiResponse<ApplicationDocuments>> {
        return await nonAcademicClient.post<ApplicationDocuments>("/Applications/documents", data);
    }

    async getSubmittedPreview(): Promise<ApiResponse<any>> {
        return await nonAcademicClient.get<any>("/Applications/submitted-preview");
    }

    async getPromotionHistory(): Promise<ApiResponse<HistoricalApplication[]>> {
        return await nonAcademicClient.get<HistoricalApplication[]>("/Applications/history");
    }

    async getPromotionLetter(applicationId?: string): Promise<ApiResponse<PromotionLetterData>> {
        const params = applicationId ? `?applicationId=${applicationId}` : '';
        return await nonAcademicClient.get<PromotionLetterData>(`/Applications/promotion-letter${params}`);
    }

    async getStaffUpdates(page = 1, pageSize = 10, search?: string): Promise<ApiResponse<PagedResult<StaffUpdateItem>>> {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (search) params.set('search', search);
        return await nonAcademicClient.get<PagedResult<StaffUpdateItem>>(`/StaffUpdates?${params.toString()}`);
    }

    async getStaffUpdate(id: string): Promise<ApiResponse<StaffUpdateItem>> {
        return await nonAcademicClient.get<StaffUpdateItem>(`/StaffUpdates/${id}`);
    }

    async getEligibilityForecast(): Promise<ApiResponse<EligibilityForecastResponse>> {
        return await nonAcademicClient.get<EligibilityForecastResponse>("/Applications/eligibility-forecast");
    }
}

export const nonAcademicService = new NonAcademicService();
