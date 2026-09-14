import { ApplicationStatus } from "./auth";

export interface ApplicationCategoryState {
    teachingCategoryStatus: ApplicationStatus;
    publicationCategoryStatus: ApplicationStatus;
    serviceCategoryStatus: ApplicationStatus;
    numberOfRecordsForTeaching: number;
    numberOfRecordsForPublication: number;
    numberOfRecordsForService: number;
    teachingPerformance: string;
    servicePerformance: string;
    publicationPerformance: string;
    teachingCategoryId: string;
    publicationCategoryId: string;
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

export interface TeachingResponse {
    completedCategories: number;
    averageScore: number | null;
    performanceLevel: string;
    lectureLoad: DimensionResponseData | null;
    abilityToAdaptToTeaching: DimensionResponseData | null;
    regularityAndPunctuality: DimensionResponseData | null;
    qualityOfLectureMaterial: DimensionResponseData | null;
    performanceOfStudentInExam: DimensionResponseData | null;
    abilityToCompleteSyllabus: DimensionResponseData | null;
    qualityOfExamQuestionAndMarkingScheme: DimensionResponseData | null;
    punctualityInSettingExamQuestion: DimensionResponseData | null;
    supervisionOfProjectWorkAndThesis: DimensionResponseData | null;
    studentReactionToAndAssessmentOfTeaching: DimensionResponseData | null;
}

export interface PublicationResponseData {
    id: string;
    title: string;
    year: number;
    score: number; // Baseline (already includes presentationBonus when presented)
    applicantScore: number;
    presentationBonus: number;
    publicationTypeId: string;
    remark: string | null;
    evidence: string[];
}

export interface PublicationResponse {
    performanceLevel: string;
    publications: PublicationResponseData[];
}

export interface ServiceResponseData {
    id: string;
    servicePositionId: string;
    categoryId: string;
    categoryName: string;
    positionName: string;
    committeeName: string | null;
    isActing: boolean | null;
    score: number; // System-computed, read-only
    systemGeneratedScore: number;
    remark: string | null;
    evidence: string[];
}

export interface ServiceResponse {
    performanceLevel: string;
    services: ServiceResponseData[];
}

export interface ServiceCategoryPosition {
    id: string;
    name: string;
    score: number;
}

export interface ServiceCategoryOption {
    id: string;
    name: string;
    description: string | null;
    requiresDesignation: boolean;
    requiresCommitteeName: boolean;
    actingScoreMultiplier: number;
    fullTimeScoreMultiplier: number;
    displayOrder: number;
    positions: ServiceCategoryPosition[];
}

export interface OverallReview {
    applicationId: string;
    status: string;
    currentReviewStage: string;
    submissionDate: string | null;
    totalTeachingScore: number;
    totalPublicationScore: number;
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
        teaching: string;
        publication: string;
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
