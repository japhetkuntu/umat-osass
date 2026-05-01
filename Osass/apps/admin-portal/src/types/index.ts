// Admin Portal Types — aligned with backend API responses

// Auth
export interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  metaData?: AdminProfile;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string | null;
}

// School / Faculty / Department hierarchy
export interface School extends BaseEntity {
  name: string;
}

export interface Faculty extends BaseEntity {
  name: string;
  schoolId: string;
  schoolName: string;
}

export interface Department extends BaseEntity {
  name: string;
  facultyId?: string;
  facultyName?: string;
  schoolId: string;
  schoolName: string;
  departmentType: string; // "academic" | "non-academic"
}

// Staff
export interface Staff extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  staffId: string;
  position: string;
  previousPosition: string;
  lastAppointmentOrPromotionDate: string;
  title: string;
  staffCategory: string; // "Academic" | "Non-Academic"
  universityRole?: string;
  departmentId: string;
  departmentName?: string;
  facultyId?: string;
  facultyName?: string;
  schoolId: string;
  schoolName?: string;
}

// Academic Position (Promotion Track)
export interface AcademicPosition extends BaseEntity {
  name: string;
  performanceCriteria: string[];
  minimumNumberOfYearsFromLastPromotion: number;
  previousPosition?: string;
  minimumNumberOfPublications: number;
  minimumNumberOfRefereedJournal: number;
}

// Service Positions
export interface ServicePosition extends BaseEntity {
  name: string;
  score: number;
  serviceType: string;
}

// Publication Indicators
export interface PublicationIndicator extends BaseEntity {
  name: string;
  score: number;
  scoreForPresentation: number;
}

// Committee Member
export interface CommitteeMember extends BaseEntity {
  staffId: string;
  staffName?: string;
  staffEmail?: string;
  committeeType: string; // "DAPC" | "FAPC" | "UAPC"
  canSubmitReviewedApplication: boolean;
  isChairperson: boolean;
  departmentId?: string;
  departmentName?: string;
  facultyId?: string;
  facultyName?: string;
  schoolId?: string;
  schoolName?: string;
}

// Dashboard Stats (aggregated client-side for now)
export interface DashboardStats {
  // Organization
  totalSchools: number;
  totalFaculties: number;
  totalDepartments: number;
  totalUnits: number;
  // Academic
  totalAcademicStaff: number;
  totalAcademicPositions: number;
  totalServicePositions: number;
  totalPublicationIndicators: number;
  totalAcademicCommitteeMembers: number;
  // Non-Academic
  totalNonAcademicStaff: number;
  totalNonAcademicPositions: number;
  totalNonAcademicCommitteeMembers: number;
  totalKnowledgeMaterialIndicators: number;
  // Combined
  totalStaff: number;
  totalCommitteeMembers: number;
}

// Form types — match backend request models
export interface SchoolFormData {
  name: string;
}

export interface FacultyFormData {
  name: string;
  schoolId: string;
}

export interface DepartmentFormData {
  name: string;
  facultyId?: string;  // For academic departments
  schoolId?: string;   // For non-academic units/sections
  departmentType: string;
}

export interface StaffFormData {
  email: string;
  firstName: string;
  lastName: string;
  staffId: string;
  position: string;
  previousPosition: string;
  lastAppointmentOrPromotionDate: string;
  title: string;
  staffCategory: string;
  universityRole?: string;
  departmentId: string;
  facultyId?: string;
  schoolId: string;
}

export interface AcademicPositionFormData {
  name: string;
  performanceCriteria: string[];
  minimumNumberOfYearsFromLastPromotion: number;
  previousPosition?: string;
  minimumNumberOfPublications: number;
  minimumNumberOfRefereedJournal: number;
}

export interface ServicePositionFormData {
  name: string;
  score: number;
  serviceType: string;
}

export interface PublicationIndicatorFormData {
  name: string;
  score: number;
  scoreForPresentation: number;
}

export interface CommitteeMemberFormData {
  staffId: string;
  committeeType: string;
  canSubmitReviewedApplication: boolean;
  isChairperson: boolean;
  departmentId?: string;
  facultyId?: string;
  schoolId?: string;
}

// Staff Updates
export interface StaffUpdate extends BaseEntity {
  title: string;
  content: string;
  category: string;
  priority: string;
  isVisible: boolean;
  publishedAt: string | null;
  createdBy: string;
}

export interface StaffUpdateFormData {
  title: string;
  content: string;
  category: string;
  priority: string;
  isVisible: boolean;
}

export interface AuditLog extends BaseEntity {
  platform: string;
  action: string;
  performedByUserId: string;
  httpMethod?: string;
  requestPath?: string;
  entityType?: string;
  entityId?: string;
  performedByName?: string;
  performedByEmail?: string;
  performedByRole?: string;
  ipAddress?: string;
  userAgent?: string;
  statusCode?: number;
}

export interface AuditLogFilters {
  platform?: string;
  performedByUserId?: string;
  entityType?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ==================== Non-Academic ====================

export interface NonAcademicCommitteeMember extends BaseEntity {
  staffId: string;
  staffName?: string;
  staffEmail?: string;
  committeeType: string; // "HOU" | "AAPSC" | "UAPC"
  canSubmitReviewedApplication: boolean;
  isChairperson: boolean;
  unitId?: string;
}

export interface NonAcademicCommitteeMemberFormData {
  staffId: string;
  committeeType: string;
  canSubmitReviewedApplication: boolean;
  isChairperson: boolean;
  unitId?: string;
}

export interface NonAcademicPosition extends BaseEntity {
  name: string;
  performanceCriteria: string[];
  minimumNumberOfYearsFromLastPromotion: number;
  previousPosition?: string;
  minimumNumberOfKnowledgeMaterials: number;
  minimumNumberOfJournals: number;
  unitType?: string;
}

export interface NonAcademicPositionFormData {
  name: string;
  performanceCriteria: string[];
  minimumNumberOfYearsFromLastPromotion: number;
  previousPosition?: string;
  minimumNumberOfKnowledgeMaterials: number;
  minimumNumberOfJournals: number;
  unitType?: string;
}

// Knowledge Material Indicators (non-academic)
export interface KnowledgeMaterialIndicator extends BaseEntity {
  name: string;
  score: number;
  scoreForPresentation: number;
}

export interface KnowledgeMaterialIndicatorFormData {
  name: string;
  score: number;
  scoreForPresentation: number;
}
