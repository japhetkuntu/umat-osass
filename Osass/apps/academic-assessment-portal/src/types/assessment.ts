// Assessment Types

export interface CommitteeMembership {
  committeeType: string;
  isChairperson: boolean;
  canSubmitReviewedApplication: boolean;
  departmentId?: string;
  facultyId?: string;
  schoolId?: string;
}

export interface CommitteeMemberInfo {
  staffId: string;
  staffName: string;
  email?: string;
  committees: CommitteeMembership[];
}

export interface PerformanceSummary {
  teachingPerformance: string;
  publicationPerformance: string;
  servicePerformance: string;
  totalTeachingScore: number;
  totalPublicationScore: number;
  totalServiceScore: number;
}

export interface PendingApplication {
  applicationId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  currentPosition: string;
  applyingForPosition: string;
  departmentName: string;
  facultyName: string;
  submissionDate: string;
  receivedByCommitteeDate?: string;
  reviewStatus: string;
  applicationStatus: string;
  isResubmission: boolean;
  resubmissionCount: number;
  applicantPerformance: PerformanceSummary;
  reviewedByMemberCount: number;
}

export interface TeachingCategoryAssessment {
  categoryName: string;
  categoryKey: string;
  applicantScore?: number;
  applicantRemarks?: string;
  dapcScore?: number;
  dapcRemarks?: string;
  fapcScore?: number;
  fapcRemarks?: string;
  uapcScore?: number;
  uapcRemarks?: string;
  supportingEvidence: string[];
}

export interface TeachingAssessmentData {
  applicantPerformance?: string;
  dapcPerformance?: string;
  fapcPerformance?: string;
  uapcPerformance?: string;
  totalCategoriesAssessed: number;
  categories: TeachingCategoryAssessment[];
}

export interface PublicationRecordAssessment {
  id: string;
  title: string;
  year: number;
  publicationType?: string;
  systemGeneratedScore: number;
  applicantScore?: number;
  applicantRemarks?: string;
  dapcScore?: number;
  dapcRemarks?: string;
  fapcScore?: number;
  fapcRemarks?: string;
  uapcScore?: number;
  uapcRemarks?: string;
  supportingEvidence: string[];
  isPresented?: boolean;
  presentationEvidence?: string[];
}

export interface PublicationAssessmentData {
  applicantPerformance?: string;
  dapcPerformance?: string;
  fapcPerformance?: string;
  uapcPerformance?: string;
  totalPublications: number;
  records: PublicationRecordAssessment[];
}

export interface ServiceRecordAssessment {
  id: string;
  serviceTitle?: string;
  role?: string;
  duration?: string;
  serviceType?: string;
  systemGeneratedScore: number;
  applicantScore?: number;
  applicantRemarks?: string;
  dapcScore?: number;
  dapcRemarks?: string;
  fapcScore?: number;
  fapcRemarks?: string;
  uapcScore?: number;
  uapcRemarks?: string;
  supportingEvidence: string[];
  isActing?: boolean;
}

export interface ServiceAssessmentData {
  applicantPerformance?: string;
  dapcPerformance?: string;
  fapcPerformance?: string;
  uapcPerformance?: string;
  totalServiceRecords: number;
  universityService: ServiceRecordAssessment[];
  nationalInternationalService: ServiceRecordAssessment[];
}

export interface PreviousAssessment {
  committeeLevel: string;
  assessmentDate: string;
  assessedBy?: string;
  teachingPerformance?: string;
  publicationPerformance?: string;
  servicePerformance?: string;
  overallRemarks?: string;
  recommendation?: string;
}

export interface ActivityHistoryItem {
  id: string;
  activityType: string;
  description?: string;
  performedBy?: string;
  committeeLevel?: string;
  isChairperson: boolean;
  activityDate: string;
  categoryAffected?: string;
  previousStatus?: string;
  newStatus?: string;
  additionalData?: {
    previousScore?: number;
    newScore?: number;
    remarks?: string;
    returnReason?: string;
  };
}

export interface ApplicationForAssessment {
  applicationId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  currentPosition: string;
  applyingForPosition: string;
  departmentName: string;
  facultyName: string;
  schoolName: string;
  submissionDate: string;
  reviewStatus: string;
  applicationStatus: string;
  performanceCriteria?: string[];
  teaching: TeachingAssessmentData;
  publications: PublicationAssessmentData;
  services: ServiceAssessmentData;
  previousAssessments: PreviousAssessment[];
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

export interface TeachingAssessmentScores {
  lectureLoad?: CategoryScore;
  abilityToAdaptToTeaching?: CategoryScore;
  regularityAndPunctuality?: CategoryScore;
  qualityOfLectureMaterial?: CategoryScore;
  performanceOfStudentInExam?: CategoryScore;
  abilityToCompleteSyllabus?: CategoryScore;
  qualityOfExamQuestionAndMarkingScheme?: CategoryScore;
  punctualityInSettingExamQuestion?: CategoryScore;
  supervisionOfProjectWorkAndThesis?: CategoryScore;
  studentReactionToAndAssessmentOfTeaching?: CategoryScore;
}

export interface RecordScore {
  recordId: string;
  score: number;
  remarks?: string;
}

export interface SubmitAssessmentScoresRequest {
  applicationId: string;
  teachingScores?: TeachingAssessmentScores;
  publicationScores?: RecordScore[];
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

// Promotion Validation Types
export interface ValidationItem {
  category: string;
  requirement: string;
  actualValue: string;
  isMet: boolean;
  notes?: string;
  severity: "Info" | "Warning" | "Critical";
}

export interface PositionRequirements {
  positionName: string;
  minimumYearsFromLastPromotion: number;
  minimumPublications: number;
  minimumRefereedJournals: number;
  acceptablePerformanceCriteria: string[];
  performanceCriteriaDescription?: string;
}

export interface ApplicantPerformanceAnalysis {
  yearsSinceLastPromotion: number;
  totalPublications: number;
  refereedJournalCount: number;
  teachingPerformance: string;
  publicationPerformance: string;
  servicePerformance: string;
  performanceCombination: string;
  teachingScore: number;
  publicationScore: number;
  serviceScore: number;
}

export interface PromotionValidationResponse {
  applicationId: string;
  applicantName: string;
  currentPosition: string;
  applyingForPosition: string;
  recommendation: "Approve" | "ReturnForUpdate";
  meetsAllRequirements: boolean;
  summary: string;
  requirements: PositionRequirements;
  performance: ApplicantPerformanceAnalysis;
  validationItems: ValidationItem[];
  strengths: string[];
  areasForImprovement: string[];
}
