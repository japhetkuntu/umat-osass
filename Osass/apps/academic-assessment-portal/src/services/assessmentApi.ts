import {
  ApiResponse,
  AssessmentDashboard,
  ApplicationForAssessment,
  PendingApplication,
  CommitteeMemberInfo,
  ActivityHistoryItem,
  SubmitAssessmentScoresRequest,
  ReturnApplicationRequest,
  AdvanceApplicationRequest,
  AddAssessmentCommentRequest,
  PromotionValidationResponse,
} from "@/types/assessment";
import { academicClient } from "./apiClient";

type PagedResponse<T> = {
  results: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  count: number;
  totalPages: number;
};

export const assessmentApi = {
  // Get committee member info
  getMemberInfo: () => 
    academicClient.get<CommitteeMemberInfo>("/assessment/member-info"),

  // Get dashboard statistics
  getDashboard: () => 
    academicClient.get<AssessmentDashboard>("/assessment/dashboard"),

  // Get pending applications for a committee
  getPendingApplications: (committeeType: string) =>
    academicClient.get<PagedResponse<PendingApplication>>(`/assessment/pending/${committeeType}`),

  // Get reviewed/completed applications history for a committee
  getApplicationHistory: (committeeType: string) =>
    academicClient.get<PagedResponse<PendingApplication>>(`/assessment/history/${committeeType}`),

  // Get application details for assessment
  getApplicationForAssessment: (applicationId: string) =>
    academicClient.get<ApplicationForAssessment>(`/assessment/${applicationId}`),

  // Submit assessment scores (chairperson only)
  submitScores: (request: SubmitAssessmentScoresRequest) =>
    academicClient.post<boolean>(`/assessment/${request.applicationId}/scores`, request),

  // Add comment (any committee member)
  addComment: (request: AddAssessmentCommentRequest) =>
    academicClient.post<boolean>(`/assessment/${request.applicationId}/comment`, request),

  // Return application to applicant (chairperson only)
  returnApplication: (request: ReturnApplicationRequest) =>
    academicClient.post<boolean>(`/assessment/${request.applicationId}/return`, request),

  // Advance application to next committee (chairperson only)
  advanceApplication: (request: AdvanceApplicationRequest) =>
    academicClient.post<boolean>(`/assessment/${request.applicationId}/advance`, request),

  // Get activity history
  getActivityHistory: (applicationId: string) =>
    academicClient.get<ActivityHistoryItem[]>(`/assessment/${applicationId}/history`),

  // Approve application (UAPC only)
  approveApplication: (applicationId: string, recommendation?: string) =>
    academicClient.post<boolean>(`/assessment/${applicationId}/approve`, { recommendation }),

  // Reject application (UAPC only)
  rejectApplication: (applicationId: string, reason: string) =>
    academicClient.post<boolean>(`/assessment/${applicationId}/reject`, { reason }),

  // Validate application for promotion (UAPC only)
  validateForPromotion: (applicationId: string) =>
    academicClient.get<PromotionValidationResponse>(`/assessment/${applicationId}/validate`),
};

export default assessmentApi;
