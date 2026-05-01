import { ApplicationStatus } from "./auth";

export interface KnowledgeMaterialIndicator {
    id: string;
    name: string;
    score: number;
    scoreForPresentation: number;
}

export interface ApplicationCategoryState {
    performanceAtWorkCategoryStatus: ApplicationStatus;
    knowledgeProfessionCategoryStatus: ApplicationStatus;
    serviceCategoryStatus: ApplicationStatus;
    numberOfRecordsForPerformanceAtWork: number;
    numberOfRecordsForKnowledgeProfession: number;
    numberOfRecordsForService: number;
    performanceAtWorkPerformance: string;
    servicePerformance: string;
    knowledgeProfessionPerformance: string;
    performanceAtWorkCategoryId: string;
    knowledgeProfessionCategoryId: string;
    serviceCategoryId: string;
    applicationId: string;
    applicationStatus: string;
    reviewStatus: string;
    curriculumVitaeUrl?: string;
    curriculumVitaeFileName?: string;
    curriculumVitaeUploadedAt?: string | null;
    applicationLetterUrl?: string;
    applicationLetterFileName?: string;
    applicationLetterUploadedAt?: string | null;
}

export interface ApplicationDocuments {
    applicationId: string;
    curriculumVitaeUrl: string;
    curriculumVitaeFileName: string;
    curriculumVitaeUploadedAt: string | null;
    applicationLetterUrl: string;
    applicationLetterFileName: string;
    applicationLetterUploadedAt: string | null;
}

export interface DimensionResponseData {
    id: string;
    score: number;
    remark: string | null;
    evidence: string[];
}

export interface PerformanceAtWorkResponse {
    completedCategories: number;
    averageScore: number | null;
    performanceLevel: string;
    accuracyOnSchedule: DimensionResponseData | null;
    qualityOfWork: DimensionResponseData | null;
    punctualityAndRegularity: DimensionResponseData | null;
    knowledgeOfProcedures: DimensionResponseData | null;
    abilityToWorkOnOwn: DimensionResponseData | null;
    abilityToWorkUnderPressure: DimensionResponseData | null;
    additionalResponsibility: DimensionResponseData | null;
    humanRelations: DimensionResponseData | null;
    initiativeAndForesight: DimensionResponseData | null;
    abilityToInspireAndMotivate: DimensionResponseData | null;
}

export interface KnowledgeProfessionResponseData {
    id: string;
    title: string;
    year: number;
    systemGeneratedScore: number;
    applicantScore: number;
    materialTypeId: string;
    remark: string | null;
    evidence: string[];
}

export interface KnowledgeProfessionResponse {
    performanceLevel: string;
    materials: KnowledgeProfessionResponseData[];
}

export interface NonAcademicServiceResponseData {
    id: string;
    serviceTitle: string;
    score: number;
    remark: string | null;
    evidence: string[];
}

export interface NonAcademicServiceResponse {
    performanceLevel: string;
    universityCommunity: NonAcademicServiceResponseData[];
    nationalInternationalCommunity: NonAcademicServiceResponseData[];
}

export interface ServicePositionIndicator {
    id: string;
    name: string;
    score: number;
    serviceType: string;
}

export interface OverallReview {
    applicationId: string;
    status: string;
    currentReviewStage: string;
    submissionDate: string | null;
    totalPerformanceAtWorkScore: number;
    totalKnowledgeProfessionScore: number;
    totalServiceScore: number;
    overallPerformance: string;
}

export interface HistoricalApplication {
    id: string;
    promotionPosition: string;
    applicantCurrentPosition: string;
    applicationStatus: string;
    reviewStatus: string;
    createdAt: string;
    submissionDate?: string;
    isActive: boolean;
    feedback?: string;
    performance?: {
        performanceAtWork: string;
        knowledgeProfession: string;
        service: string;
    };
}

export interface StaffUpdateItem {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    publishedAt: string | null;
    createdAt: string;
}

export interface PagedResult<T> {
    results: T[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    count: number;
    totalPages: number;
}
