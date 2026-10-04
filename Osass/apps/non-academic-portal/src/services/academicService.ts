import type { KnowledgeMaterialIndicator, ServicePositionIndicator, SubmittedApplicationResponse } from "../types/academic";
import { ApiResponse } from "../types/auth";
import {
    ApplicationCategoryState,
    PerformanceAtWorkResponse as TeachingResponse,
    KnowledgeProfessionResponse as PublicationResponse,
    NonAcademicServiceResponse as ServiceResponse,
    OverallReview,
    HistoricalApplication,
    StaffUpdateItem,
    PagedResult,
} from "../types/academic";
import { PromotionLetterData } from "../types/promotionLetter";
import { EligibilityForecastResponse } from "../types/forecast";
import { nonAcademicClient as academicClient } from "./apiClient";

class AcademicService {
    async getApplicationCategoryState(): Promise<ApiResponse<ApplicationCategoryState>> {
        return await academicClient.get<ApplicationCategoryState>("/Applications/category-state");
    }

    async getOverallReview(): Promise<ApiResponse<OverallReview>> {
        return await academicClient.get<OverallReview>("/Applications/overall-review");
    }

    async getTeachingState(): Promise<ApiResponse<TeachingResponse>> {
        return await academicClient.get<TeachingResponse>("/PerformanceAtWork");
    }

    async getPublicationState(): Promise<ApiResponse<PublicationResponse>> {
        return await academicClient.get<PublicationResponse>("/KnowledgeProfession");
    }

    async getServiceState(): Promise<ApiResponse<ServiceResponse>> {
        return await academicClient.get<ServiceResponse>("/NonAcademicService");
    }

    async updateTeaching(data: FormData): Promise<ApiResponse<unknown>> {
        return await academicClient.post<unknown>("/PerformanceAtWork", data);
    }

    async updatePublication(data: FormData): Promise<ApiResponse<unknown>> {
        return await academicClient.post<unknown>("/KnowledgeProfession", data);
    }

    async updateService(data: FormData): Promise<ApiResponse<unknown>> {
        return await academicClient.post<unknown>("/NonAcademicService", data);
    }

    async getPublicationIndicators(): Promise<ApiResponse<KnowledgeMaterialIndicator[]>> {
        return await academicClient.get<KnowledgeMaterialIndicator[]>("/KnowledgeProfession/indicators");
    }

    async getServicePositions(): Promise<ApiResponse<ServicePositionIndicator[]>> {
        return await academicClient.get<ServicePositionIndicator[]>("/NonAcademicService/positions");
    }

    async submitApplication(): Promise<ApiResponse<boolean>> {
        return await academicClient.post<boolean>("/Applications/submit");
    }

    async getSubmittedPreview(): Promise<ApiResponse<SubmittedApplicationResponse>> {
        return await academicClient.get<SubmittedApplicationResponse>("/Applications/submitted-preview");
    }

    async getPromotionHistory(): Promise<ApiResponse<HistoricalApplication[]>> {
        return await academicClient.get<HistoricalApplication[]>("/Applications/history");
    }

    async getPromotionLetter(applicationId?: string): Promise<ApiResponse<PromotionLetterData>> {
        const params = applicationId ? `?applicationId=${applicationId}` : '';
        return await academicClient.get<PromotionLetterData>(`/Applications/promotion-letter${params}`);
    }

    async getStaffUpdates(page = 1, pageSize = 10, search?: string): Promise<ApiResponse<PagedResult<StaffUpdateItem>>> {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (search) params.set('search', search);
        return await academicClient.get<PagedResult<StaffUpdateItem>>(`/StaffUpdates?${params.toString()}`);
    }

    async getStaffUpdate(id: string): Promise<ApiResponse<StaffUpdateItem>> {
        return await academicClient.get<StaffUpdateItem>(`/StaffUpdates/${id}`);
    }

    async getEligibilityForecast(): Promise<ApiResponse<EligibilityForecastResponse>> {
        return await academicClient.get<EligibilityForecastResponse>("/Applications/eligibility-forecast");
    }
}

export const academicService = new AcademicService();
