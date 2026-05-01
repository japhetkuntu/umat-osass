// Assessment Types

export interface CommitteeMembership {
  committeeType: string;
  isChairperson: boolean;
  canSubmitReviewedApplication: boolean;
  unitId?: string;
}

export interface CommitteeMemberInfo {
  staffId: string;
  staffName: string;
  email?: string;
  committees: CommitteeMembership[];
}

export interface PerformanceSummary {
  performanceAtWorkPerformance: string;
  knowledgeProfessionPerformance: string;
  servicePerformance: string;
  totalPerformanceAtWorkScore: number;
  totalKnowledgeProfessionScore: number;
  totalServiceScore: number;
}

export interface PendingApplication {
  applicationId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  currentPosition: string;
  applyingForPosition: string;
  unitName: string;
  submissionDate: string;
  receivedByCommitteeDate?: string;
  reviewStatus: string;
  applicationStatus: string;
  isResubmission: boolean;
  resubmissionCount: number;
  applicantPerformance: PerformanceSummary;
  reviewedByMemberCount: number;
}

export interface WorkCategoryAssessment {
  categoryName: string;
  categoryKey: string;
  applicantScore?: number;
  applicantRemarks?: string;
  houScore?: number;
  houRemarks?: string;
  aapscScore?: number;
  aapscRemarks?: string;
  uapcScore?: number;
  uapcRemarks?: string;
  supportingEvidence: string[];
}

export interface PerformanceAtWorkAssessmentData {
  applicantPerformance?: string;
  houPerformance?: string;
  aapscPerformance?: string;
  uapcPerformance?: string;
  totalCategoriesAssessed: number;
  categories: WorkCategoryAssessment[];
}

export interface KnowledgeMaterialAssessment {
  id: string;
  title: string;
  year: number;
  materialTypeName?: string;
  systemGeneratedScore: number;
  applicantScore?: number;
  applicantRemarks?: string;
  houScore?: number;
  houRemarks?: string;
  aapscScore?: number;
  aapscRemarks?: string;
  uapcScore?: number;
  uapcRemarks?: string;
  supportingEvidence: string[];
  isPresented?: boolean;
  presentationEvidence?: string[];
}

export interface KnowledgeProfessionAssessmentData {
  applicantPerformance?: string;
  houPerformance?: string;
  aapscPerformance?: string;
  uapcPerformance?: string;
  totalMaterials: number;
  materials: KnowledgeMaterialAssessment[];
}

export interface ServiceRecordAssessment {
  id: string;
  serviceTitle?: string;
  role?: string;
  duration?: string;
  isActing?: boolean;
  serviceType?: string;
  systemGeneratedScore: number;
  applicantScore?: number;
  applicantRemarks?: string;
  houScore?: number;
  houRemarks?: string;
  aapscScore?: number;
  aapscRemarks?: string;
  uapcScore?: number;
  uapcRemarks?: string;
  supportingEvidence: string[];
}

export interface ServiceAssessmentData {
  applicantPerformance?: string;
  houPerformance?: string;
  aapscPerformance?: string;
  uapcPerformance?: string;
  totalRecords: number;
  universityServices: ServiceRecordAssessment[];
  nationalInternationalServices: ServiceRecordAssessment[];
}

export interface PreviousAssessment {
  committeeLevel: string;
  assessmentDate: string;
  assessedBy?: string;
  performanceAtWorkPerformance?: string;
  knowledgeProfessionPerformance?: string;
  servicePerformance?: string;
  overallRemarks?: string;
  recommendation?: string;
}

export interface ActivityHistoryItem {
  activityType: string;
  description?: string;
  performedBy?: string;
  committeeLevel?: string;
  activityDate: string;
}

export interface ApplicationForAssessment {
  applicationId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  currentPosition: string;
  applyingForPosition: string;
  unitName: string;
  submissionDate: string;
  reviewStatus: string;
  applicationStatus: string;
  performanceCriteria?: string[];
  performanceAtWork: PerformanceAtWorkAssessmentData;
  knowledgeProfession: KnowledgeProfessionAssessmentData;
  services: ServiceAssessmentData;
  previousAssessments?: PreviousAssessment[];
  activityHistory: ActivityHistoryItem[];
}

export interface AssessmentDashboard {
  memberInfo: CommitteeMemberInfo;
  pendingApplicationsCount: number;
  inProgressCount: number;
  completedThisMonthCount: number;
  returnedCount: number;
  recentActivities: RecentActivitySummary[];
}

export interface RecentActivitySummary {
  applicationId: string;
  applicantName?: string;
  activityType: string;
  description?: string;
  activityDate: string;
}

// Request Types
export interface CategoryScore {
  score: number;
  remarks?: string;
}

export interface PerformanceAtWorkAssessmentScores {
  accuracyOnSchedule?: CategoryScore;
  qualityOfWork?: CategoryScore;
  punctualityAndRegularity?: CategoryScore;
  knowledgeOfProcedures?: CategoryScore;
  abilityToWorkOnOwn?: CategoryScore;
  abilityToWorkUnderPressure?: CategoryScore;
  additionalResponsibility?: CategoryScore;
  humanRelations?: CategoryScore;
  initiativeAndForesight?: CategoryScore;
  abilityToInspireAndMotivate?: CategoryScore;
}

export interface RecordScore {
  recordId: string;
  score: number;
  remarks?: string;
}

export interface SubmitAssessmentScoresRequest {
  applicationId: string;
  performanceAtWorkScores?: PerformanceAtWorkAssessmentScores;
  knowledgeProfessionScores?: RecordScore[];
  serviceScores?: RecordScore[];
  overallRemarks?: string;
}

export interface ReturnApplicationRequest {
  applicationId: string;
  returnReason: string;
  detailedComments?: string;
  categoriesRequiringAttention?: string[];
}

export interface AdvanceApplicationRequest {
  applicationId: string;
  recommendation?: string;
}

export interface AddAssessmentCommentRequest {
  applicationId: string;
  category: string;
  recordId?: string;
  comment: string;
}

// API Response Type
export interface ApiResponse<T> {
  message: string;
  code: number;
  data?: T;
  subCode?: string;
  errors?: { field: string; errorMessage: string }[];
  success?: boolean;
}

// Authentication Types
export interface StaffLoginMetaData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  title: string;
  staffCategory: string;
  universityRole: string | null;
  staffId: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  metaData?: StaffLoginMetaData;
}

export interface AuthState {
  user: StaffLoginMetaData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  committees: CommitteeMembership[];
}

export interface PromotionValidationResponse {
  meetsPerformanceCriteria: boolean;
  meetsKnowledgeMaterialRequirement: boolean;
  meetsJournalRequirement: boolean;
  meetsYearsRequirement: boolean;
  isRecommended: boolean;
  summary: string;
  failedCriteria: string[];
}
