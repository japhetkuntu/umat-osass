import { adminClient, identityClient, type PagedResult } from './apiClient';
import type {
  School,
  Faculty,
  Department,
  Staff,
  AcademicPosition,
  ServicePosition,
  PublicationIndicator,
  CommitteeMember,
  StaffUpdate,
  DashboardStats,
  SchoolFormData,
  FacultyFormData,
  DepartmentFormData,
  StaffFormData,
  AcademicPositionFormData,
  ServicePositionFormData,
  PublicationIndicatorFormData,
  CommitteeMemberFormData,
  StaffUpdateFormData,
  LoginResponse,
  AdminProfile,
  AuditLog,
  AuditLogFilters,
  NonAcademicCommitteeMember,
  NonAcademicCommitteeMemberFormData,
  NonAcademicPosition,
  NonAcademicPositionFormData,
  KnowledgeMaterialIndicator,
  KnowledgeMaterialIndicatorFormData,
  AdminUser,
  AdminUserFormData,
} from '@/types';

// Helper to build query string from filter params
function buildQuery(params: Record<string, any>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

// ==================== Schools ====================
export const fetchSchools = async (
  page = 1,
  pageSize = 50,
  search?: string,
): Promise<PagedResult<School>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await adminClient.get<PagedResult<School>>(`/Schools${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const fetchSchool = async (id: string): Promise<School | null> => {
  const res = await adminClient.get<School>(`/Schools/${id}`);
  return res.success ? res.data : null;
};

export const createSchool = async (data: SchoolFormData): Promise<School> => {
  const res = await adminClient.post<School>('/Schools', data);
  if (!res.success) throw new Error(res.message || 'Failed to create school');
  return res.data;
};

export const updateSchool = async (id: string, data: Partial<SchoolFormData>): Promise<School> => {
  const res = await adminClient.put<School>(`/Schools/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update school');
  return res.data;
};

export const deleteSchool = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/Schools/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete school');
};

// ==================== Faculties ====================
export const fetchFaculties = async (
  page = 1,
  pageSize = 50,
  search?: string,
): Promise<PagedResult<Faculty>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await adminClient.get<PagedResult<Faculty>>(`/Facultys${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createFaculty = async (data: FacultyFormData): Promise<Faculty> => {
  const res = await adminClient.post<Faculty>('/Facultys', data);
  if (!res.success) throw new Error(res.message || 'Failed to create faculty');
  return res.data;
};

export const updateFaculty = async (id: string, data: Partial<FacultyFormData>): Promise<Faculty> => {
  const res = await adminClient.put<Faculty>(`/Facultys/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update faculty');
  return res.data;
};

export const deleteFaculty = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/Facultys/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete faculty');
};

// ==================== Departments ====================
export const fetchDepartments = async (
  page = 1,
  pageSize = 50,
  search?: string,
): Promise<PagedResult<Department>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await adminClient.get<PagedResult<Department>>(`/Departments${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createDepartment = async (data: DepartmentFormData): Promise<Department> => {
  const res = await adminClient.post<Department>('/Departments', data);
  if (!res.success) throw new Error(res.message || 'Failed to create department');
  return res.data;
};

export const updateDepartment = async (id: string, data: Partial<DepartmentFormData>): Promise<Department> => {
  const res = await adminClient.put<Department>(`/Departments/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update department');
  return res.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/Departments/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete department');
};

// ==================== Staff ====================
export const fetchStaff = async (
  page = 1,
  pageSize = 50,
  search?: string,
  staffCategory?: string,
): Promise<PagedResult<Staff>> => {
  const query = buildQuery({ page, pageSize, search, staffCategory });
  const res = await adminClient.get<PagedResult<Staff>>(`/Staffs${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createStaff = async (data: StaffFormData): Promise<Staff> => {
  const res = await adminClient.post<Staff>('/Staffs', data);
  if (!res.success) throw new Error(res.message || 'Failed to create staff');
  return res.data;
};

export const updateStaff = async (id: string, data: Partial<StaffFormData>): Promise<Staff> => {
  const res = await adminClient.put<Staff>(`/Staffs/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update staff');
  return res.data;
};

export const deleteStaff = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/Staffs/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete staff');
};

// ==================== Academic Positions (Promotion Tracks) ====================
export const fetchAcademicPositions = async (
  page = 1,
  pageSize = 50,
  search?: string,
): Promise<PagedResult<AcademicPosition>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await adminClient.get<PagedResult<AcademicPosition>>(`/AcademicPositions${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createAcademicPosition = async (data: AcademicPositionFormData): Promise<AcademicPosition> => {
  const res = await adminClient.post<AcademicPosition>('/AcademicPositions', data);
  if (!res.success) throw new Error(res.message || 'Failed to create academic position');
  return res.data;
};

export const updateAcademicPosition = async (
  id: string,
  data: Partial<AcademicPositionFormData>,
): Promise<AcademicPosition> => {
  const res = await adminClient.put<AcademicPosition>(`/AcademicPositions/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update academic position');
  return res.data;
};

export const deleteAcademicPosition = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/AcademicPositions/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete academic position');
};

// ==================== Service Positions ====================
export const fetchServicePositions = async (
  page = 1,
  pageSize = 50,
  search?: string,
): Promise<PagedResult<ServicePosition>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await adminClient.get<PagedResult<ServicePosition>>(`/ServicePositions${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createServicePosition = async (data: ServicePositionFormData): Promise<ServicePosition> => {
  const res = await adminClient.post<ServicePosition>('/ServicePositions', data);
  if (!res.success) throw new Error(res.message || 'Failed to create service position');
  return res.data;
};

export const updateServicePosition = async (
  id: string,
  data: Partial<ServicePositionFormData>,
): Promise<ServicePosition> => {
  const res = await adminClient.put<ServicePosition>(`/ServicePositions/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update service position');
  return res.data;
};

export const deleteServicePosition = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/ServicePositions/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete service position');
};

// ==================== Publication Indicators ====================
export const fetchPublicationIndicators = async (
  page = 1,
  pageSize = 50,
  search?: string,
): Promise<PagedResult<PublicationIndicator>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await adminClient.get<PagedResult<PublicationIndicator>>(`/PublicationIndicators${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createPublicationIndicator = async (data: PublicationIndicatorFormData): Promise<PublicationIndicator> => {
  const res = await adminClient.post<PublicationIndicator>('/PublicationIndicators', data);
  if (!res.success) throw new Error(res.message || 'Failed to create publication indicator');
  return res.data;
};

export const updatePublicationIndicator = async (
  id: string,
  data: Partial<PublicationIndicatorFormData>,
): Promise<PublicationIndicator> => {
  const res = await adminClient.put<PublicationIndicator>(`/PublicationIndicators/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update publication indicator');
  return res.data;
};

export const deletePublicationIndicator = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/PublicationIndicators/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete publication indicator');
};

// ==================== Committee Members ====================
export const fetchCommitteeMembers = async (
  page = 1,
  pageSize = 50,
  search?: string,
): Promise<PagedResult<CommitteeMember>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await adminClient.get<PagedResult<CommitteeMember>>(`/Committees${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createCommitteeMember = async (data: CommitteeMemberFormData): Promise<CommitteeMember> => {
  const res = await adminClient.post<CommitteeMember>('/Committees', data);
  if (!res.success) throw new Error(res.message || 'Failed to add committee member');
  return res.data;
};

export const updateCommitteeMember = async (
  id: string,
  data: Partial<CommitteeMemberFormData>,
): Promise<CommitteeMember> => {
  const res = await adminClient.put<CommitteeMember>(`/Committees/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update committee member');
  return res.data;
};

export const deleteCommitteeMember = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/Committees/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to remove committee member');
};

// ==================== Staff Updates ====================
export const fetchStaffUpdates = async (
  page = 1,
  pageSize = 10,
  search?: string,
  category?: string,
  isVisible?: boolean,
): Promise<PagedResult<StaffUpdate>> => {
  const query = buildQuery({ page, pageSize, search, category, isVisible });
  const res = await adminClient.get<PagedResult<StaffUpdate>>(`/StaffUpdates${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const fetchStaffUpdate = async (id: string): Promise<StaffUpdate | null> => {
  const res = await adminClient.get<StaffUpdate>(`/StaffUpdates/${id}`);
  return res.success ? res.data : null;
};

export const createStaffUpdate = async (data: StaffUpdateFormData): Promise<StaffUpdate> => {
  const res = await adminClient.post<StaffUpdate>('/StaffUpdates', data);
  if (!res.success) throw new Error(res.message || 'Failed to create staff update');
  return res.data;
};

export const updateStaffUpdate = async (
  id: string,
  data: StaffUpdateFormData,
): Promise<StaffUpdate> => {
  const res = await adminClient.put<StaffUpdate>(`/StaffUpdates/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update staff update');
  return res.data;
};

export const toggleStaffUpdateVisibility = async (id: string): Promise<StaffUpdate> => {
  const res = await adminClient.request<StaffUpdate>(`/StaffUpdates/${id}/visibility`, { method: 'PATCH' });
  if (!res.success) throw new Error(res.message || 'Failed to toggle visibility');
  return res.data;
};

export const deleteStaffUpdate = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/StaffUpdates/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete staff update');
};

// ==================== Audit Logs ====================
export const fetchAuditLogs = async (filters: AuditLogFilters = {}): Promise<PagedResult<AuditLog>> => {
  const query = buildQuery({ ...filters });
  const res = await adminClient.get<PagedResult<AuditLog>>(`/AuditLogs${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: 1, pageSize: 20, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

// ==================== Non-Academic Committees ====================
export const fetchNonAcademicCommitteeMembers = async (
  page = 1,
  pageSize = 50,
  search?: string,
): Promise<PagedResult<NonAcademicCommitteeMember>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await adminClient.get<PagedResult<NonAcademicCommitteeMember>>(`/NonAcademicCommittees${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createNonAcademicCommitteeMember = async (data: NonAcademicCommitteeMemberFormData): Promise<NonAcademicCommitteeMember> => {
  const res = await adminClient.post<NonAcademicCommitteeMember>('/NonAcademicCommittees', data);
  if (!res.success) throw new Error(res.message || 'Failed to add committee member');
  return res.data;
};

export const updateNonAcademicCommitteeMember = async (
  id: string,
  data: Partial<NonAcademicCommitteeMemberFormData>,
): Promise<NonAcademicCommitteeMember> => {
  const res = await adminClient.put<NonAcademicCommitteeMember>(`/NonAcademicCommittees/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update committee member');
  return res.data;
};

export const deleteNonAcademicCommitteeMember = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/NonAcademicCommittees/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to remove committee member');
};

// ==================== Non-Academic Positions ====================
export const fetchNonAcademicPositions = async (
  page = 1,
  pageSize = 50,
  search?: string,
): Promise<PagedResult<NonAcademicPosition>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await adminClient.get<PagedResult<NonAcademicPosition>>(`/NonAcademicPositions${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createNonAcademicPosition = async (data: NonAcademicPositionFormData): Promise<NonAcademicPosition> => {
  const res = await adminClient.post<NonAcademicPosition>('/NonAcademicPositions', data);
  if (!res.success) throw new Error(res.message || 'Failed to create position');
  return res.data;
};

export const updateNonAcademicPosition = async (
  id: string,
  data: Partial<NonAcademicPositionFormData>,
): Promise<NonAcademicPosition> => {
  const res = await adminClient.put<NonAcademicPosition>(`/NonAcademicPositions/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update position');
  return res.data;
};

export const deleteNonAcademicPosition = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/NonAcademicPositions/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete position');
};

// ==================== Knowledge Material Indicators ====================
export const fetchKnowledgeMaterialIndicators = async (
  page = 1,
  pageSize = 50,
  search?: string,
): Promise<PagedResult<KnowledgeMaterialIndicator>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await adminClient.get<PagedResult<KnowledgeMaterialIndicator>>(`/KnowledgeMaterialIndicators${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createKnowledgeMaterialIndicator = async (data: KnowledgeMaterialIndicatorFormData): Promise<KnowledgeMaterialIndicator> => {
  const res = await adminClient.post<KnowledgeMaterialIndicator>('/KnowledgeMaterialIndicators', data);
  if (!res.success) throw new Error(res.message || 'Failed to create knowledge material indicator');
  return res.data;
};

export const updateKnowledgeMaterialIndicator = async (
  id: string,
  data: Partial<KnowledgeMaterialIndicatorFormData>,
): Promise<KnowledgeMaterialIndicator> => {
  const res = await adminClient.put<KnowledgeMaterialIndicator>(`/KnowledgeMaterialIndicators/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update knowledge material indicator');
  return res.data;
};

export const deleteKnowledgeMaterialIndicator = async (id: string): Promise<void> => {
  const res = await adminClient.delete(`/KnowledgeMaterialIndicators/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete knowledge material indicator');
};

// ==================== Dashboard ====================
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Aggregate stats from multiple endpoints in parallel
  const [
    schools, faculties, allDepartments, academicStaff, nonAcademicStaff,
    positions, servicePositions, pubIndicators, committees,
    nonAcademicPositions, nonAcademicCommittees, knowledgeIndicators,
  ] = await Promise.all([
    fetchSchools(1, 1),
    fetchFaculties(1, 1),
    fetchDepartments(1, 100),
    fetchStaff(1, 1, undefined, 'Academic'),
    fetchStaff(1, 1, undefined, 'Non-Academic'),
    fetchAcademicPositions(1, 1),
    fetchServicePositions(1, 1),
    fetchPublicationIndicators(1, 1),
    fetchCommitteeMembers(1, 1),
    fetchNonAcademicPositions(1, 1),
    fetchNonAcademicCommitteeMembers(1, 1),
    fetchKnowledgeMaterialIndicators(1, 1),
  ]);

  const totalDepartments = allDepartments.results.filter(
    (d: { departmentType?: string }) => !d.departmentType || d.departmentType.toLowerCase() === 'academic'
  ).length;
  const totalUnits = allDepartments.results.filter(
    (d: { departmentType?: string }) => d.departmentType?.toLowerCase() === 'non-academic'
  ).length;

  return {
    totalSchools: schools.totalCount,
    totalFaculties: faculties.totalCount,
    totalDepartments,
    totalUnits,
    totalAcademicStaff: academicStaff.totalCount,
    totalNonAcademicStaff: nonAcademicStaff.totalCount,
    totalStaff: academicStaff.totalCount + nonAcademicStaff.totalCount,
    totalAcademicPositions: positions.totalCount,
    totalServicePositions: servicePositions.totalCount,
    totalPublicationIndicators: pubIndicators.totalCount,
    totalAcademicCommitteeMembers: committees.totalCount,
    totalNonAcademicPositions: nonAcademicPositions.totalCount,
    totalNonAcademicCommitteeMembers: nonAcademicCommittees.totalCount,
    totalKnowledgeMaterialIndicators: knowledgeIndicators.totalCount,
    totalCommitteeMembers: committees.totalCount + nonAcademicCommittees.totalCount,
  };
};

// ==================== Auth ====================
export const adminLogin = async (email: string, password: string) => {
  const res = await identityClient.post<LoginResponse>('/Admins/login', {
    email,
    password,
  });
  if (res.success && res.data?.accessToken) {
    localStorage.setItem('admin_token', res.data.accessToken);
    if (res.data.refreshToken) {
      localStorage.setItem('admin_refresh_token', res.data.refreshToken);
    }
    if (res.data.metaData) {
      localStorage.setItem('admin_user', JSON.stringify(res.data.metaData));
    }
  }
  return res;
};

export const adminLogout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
};

export const getAdminProfile = async () => {
  return identityClient.get<AdminProfile>('/Admins/me');
};

export const adminForgotPassword = async (email: string) => {
  return identityClient.get<{ email: string; uniqueId: string }>(`/Admins/reset-password/${encodeURIComponent(email)}`);
};

export const adminResetPassword = async (data: {
  uniqueId: string;
  otpCode: string;
  password: string;
  confirmPassword: string;
}) => {
  return identityClient.post('/Admins/reset-password', data);
};

export const adminChangePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) => {
  return identityClient.post('/Admins/change-password', data);
};

// ==================== Admin User Management (SuperAdmin only) ====================
export const fetchAdminUsers = async (
  page = 1,
  pageSize = 20,
  search?: string,
): Promise<PagedResult<AdminUser>> => {
  const query = buildQuery({ page, pageSize, search });
  const res = await identityClient.get<PagedResult<AdminUser>>(`/Admins${query}`);
  return res.data ?? { results: [], totalCount: 0, pageIndex: page, pageSize, count: 0, totalPages: 0, lowerBoundSize: 0, upperBoundSize: 0 };
};

export const createAdminUser = async (data: AdminUserFormData): Promise<AdminUser> => {
  const res = await identityClient.post<AdminUser>('/Admins', data);
  if (!res.success) throw new Error(res.message || 'Failed to create admin');
  return res.data;
};

export const updateAdminUser = async (id: string, data: Omit<AdminUserFormData, 'password'>): Promise<AdminUser> => {
  const res = await identityClient.put<AdminUser>(`/Admins/${id}`, data);
  if (!res.success) throw new Error(res.message || 'Failed to update admin');
  return res.data;
};

export const deleteAdminUser = async (id: string): Promise<void> => {
  const res = await identityClient.delete(`/Admins/${id}`);
  if (!res.success) throw new Error(res.message || 'Failed to delete admin');
};
