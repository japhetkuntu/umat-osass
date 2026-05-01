export type ApplicationStatus =
    | "not-started"
    | "draft"
    | "in-progress"
    | "submitted"
    | "under-review"
    | "decision-pending"
    | "approved"
    | "not-approved"
    | "returned";

export type ReviewStage =
    | "submitted"
    | "department-review"
    | "institutional-review"
    | "external-assessment"
    | "committee-review"
    | "council-decision";

export interface ApplicationMetaData {
    applicationId: string;
    applicationStatus: string;
    performanceCriteria: string[];
    applicationStartDate: string;
    applicationReviewStatus: string;
}

export interface PositionRequirement {
    id: string;
    name: string;
    performanceCriteria: string[];
    minimumNumberOfYearsFromLastPromotion: number;
    previousPosition: string;
    minimumNumberOfPublications: number;
    minimumNumberOfRefereedJournal: number;
}

export interface EligibilityData {
    applicantName: string;
    applicantCurrentPosition: string;
    applicantNextPosition: string;
    totalNumberOfYearsInCurrentPosition: number;
    totalNumberOfYearsRequiredInNextPosition: number;
    remainingNumberOfYearsRequiredInNextPosition: number;
    estimatedEligibilityDate: string | null;
    isEligibleToApplyForNextPosition: boolean;
    activeApplication: ApplicationMetaData | null;
    applicationRequirment: PositionRequirement | null;
}

export interface StaffLoginMetaData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    position: string;
    title: string;
    staffCategory: string;
    universityRole?: string | null;
    staffId: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string | null;
    metaData: StaffLoginMetaData;
}

export interface StaffTokenResponse extends LoginResponse {
    // Inherits accessToken, refreshToken, and metaData
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
    success: boolean;
}

export interface AuthState {
    user: StaffLoginMetaData | null;
    eligibility: EligibilityData | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
