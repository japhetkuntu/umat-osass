import { createCrudHooks } from "./createCrudHooks";
import { useQuery, keepPreviousData, type QueryKey } from '@tanstack/react-query';
import {
  fetchAllPages,
  fetchSchools,
  fetchFaculties,
  fetchDepartments,
  fetchStaff,
  fetchAcademicPositions,
  fetchServiceCategories,
  fetchServicePositions,
  fetchPublicationIndicators,
  fetchCommitteeMembers,
  fetchStaffUpdates,
  fetchAuditLogs,
  fetchNonAcademicCommitteeMembers,
  fetchNonAcademicPositions,
  fetchKnowledgeMaterialIndicators,
  fetchAdminUsers,
  createSchool,
  updateSchool,
  deleteSchool,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createStaff,
  updateStaff,
  deleteStaff,
  createAcademicPosition,
  updateAcademicPosition,
  deleteAcademicPosition,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  createServicePosition,
  updateServicePosition,
  deleteServicePosition,
  createPublicationIndicator,
  updatePublicationIndicator,
  deletePublicationIndicator,
  createCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  createStaffUpdate,
  updateStaffUpdate,
  deleteStaffUpdate,
  createNonAcademicCommitteeMember,
  updateNonAcademicCommitteeMember,
  deleteNonAcademicCommitteeMember,
  createNonAcademicPosition,
  updateNonAcademicPosition,
  deleteNonAcademicPosition,
  createKnowledgeMaterialIndicator,
  updateKnowledgeMaterialIndicator,
  deleteKnowledgeMaterialIndicator,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '@/services/api';
import type {
  SchoolFormData,
  FacultyFormData,
  DepartmentFormData,
  StaffFormData,
  AcademicPositionFormData,
  ServiceCategoryFormData,
  ServicePositionFormData,
  PublicationIndicatorFormData,
  CommitteeMemberFormData,
  StaffUpdateFormData,
  AuditLogFilters,
  NonAcademicCommitteeMemberFormData,
  NonAcademicPositionFormData,
  KnowledgeMaterialIndicatorFormData,
  AdminUserFormData,
} from '@/types';

// Query keys
export const queryKeys = {
  schools: () => ['schools'],
  faculties: () => ['faculties'],
  departments: (departmentType?: string) => departmentType ? ['departments', departmentType] : ['departments'],
  staff: (category?: string) => category ? ['staff', category] : ['staff'],
  academicPositions: () => ['academicPositions'],
  serviceCategories: () => ['serviceCategories'],
  servicePositions: () => ['servicePositions'],
  publicationIndicators: () => ['publicationIndicators'],
  knowledgeMaterialIndicators: () => ['knowledgeMaterialIndicators'],
  committeeMembers: () => ['committeeMembers'],
  nonAcademicCommitteeMembers: () => ['nonAcademicCommitteeMembers'],
  nonAcademicPositions: () => ['nonAcademicPositions'],
  staffUpdates: () => ['staffUpdates'],
  auditLogs: (filters?: object) => ['auditLogs', filters],
  adminUsers: () => ['adminUsers'],
};

const STALE_TIME = 5 * 60 * 1000;

const useListQuery = <T,>(queryKey: QueryKey, queryFn: () => Promise<T[]>) =>
  useQuery({ queryKey, queryFn, staleTime: STALE_TIME });

// ==================== SCHOOLS ====================
const schoolHooks = createCrudHooks<SchoolFormData>({
  label: 'school',
  invalidates: () => [queryKeys.schools(), queryKeys.faculties(), queryKeys.departments()],
  create: createSchool,
  update: updateSchool,
  remove: deleteSchool,
});
export const useSchools = () => useListQuery(queryKeys.schools(), () => fetchAllPages(fetchSchools));
export const useCreateSchool = schoolHooks.useCreate;
export const useUpdateSchool = schoolHooks.useUpdate;
export const useDeleteSchool = schoolHooks.useRemove;

// ==================== FACULTIES ====================
const facultyHooks = createCrudHooks<FacultyFormData>({
  label: 'faculty',
  invalidates: () => [queryKeys.faculties(), queryKeys.schools(), queryKeys.departments()],
  create: createFaculty,
  update: updateFaculty,
  remove: deleteFaculty,
});
export const useFaculties = () => useListQuery(queryKeys.faculties(), () => fetchAllPages(fetchFaculties));
export const useCreateFaculty = facultyHooks.useCreate;
export const useUpdateFaculty = facultyHooks.useUpdate;
export const useDeleteFaculty = facultyHooks.useRemove;

// ==================== DEPARTMENTS ====================
const departmentHooks = createCrudHooks<DepartmentFormData>({
  label: 'department',
  invalidates: () => [queryKeys.departments(), queryKeys.faculties(), queryKeys.staff()],
  create: createDepartment,
  update: updateDepartment,
  remove: deleteDepartment,
});
export const useDepartments = (departmentType?: string) =>
  useListQuery(queryKeys.departments(departmentType), () =>
    fetchAllPages((page, pageSize) => fetchDepartments(page, pageSize, undefined, departmentType)),
  );
export const useCreateDepartment = departmentHooks.useCreate;
export const useUpdateDepartment = departmentHooks.useUpdate;
export const useDeleteDepartment = departmentHooks.useRemove;

// ==================== STAFF ====================
const staffHooks = createCrudHooks<StaffFormData>({
  label: 'staff',
  invalidates: () => [queryKeys.staff(), queryKeys.committeeMembers(), queryKeys.nonAcademicCommitteeMembers()],
  create: createStaff,
  update: updateStaff,
  remove: deleteStaff,
});
export const useStaff = (staffCategory?: string) =>
  useListQuery(queryKeys.staff(staffCategory), () =>
    fetchAllPages((page, pageSize) => fetchStaff(page, pageSize, undefined, staffCategory)),
  );
export const useAcademicStaff = () => useStaff('Academic');
export const useNonAcademicStaff = () => useStaff('Non-Academic');
export const useCreateStaff = staffHooks.useCreate;
export const useUpdateStaff = staffHooks.useUpdate;
export const useDeleteStaff = staffHooks.useRemove;

// ==================== ACADEMIC POSITIONS ====================
const academicPositionHooks = createCrudHooks<AcademicPositionFormData>({
  label: 'academic position',
  invalidates: () => [queryKeys.academicPositions()],
  create: createAcademicPosition,
  update: updateAcademicPosition,
  remove: deleteAcademicPosition,
});
export const useAcademicPositions = () =>
  useListQuery(queryKeys.academicPositions(), () => fetchAllPages(fetchAcademicPositions));
export const useCreateAcademicPosition = academicPositionHooks.useCreate;
export const useUpdateAcademicPosition = academicPositionHooks.useUpdate;
export const useDeleteAcademicPosition = academicPositionHooks.useRemove;

// ==================== SERVICE CATEGORIES ====================
const serviceCategoryHooks = createCrudHooks<ServiceCategoryFormData>({
  label: 'service category',
  invalidates: () => [queryKeys.serviceCategories(), queryKeys.servicePositions()],
  create: createServiceCategory,
  update: updateServiceCategory,
  remove: deleteServiceCategory,
});
export const useServiceCategories = () =>
  useListQuery(queryKeys.serviceCategories(), () => fetchAllPages(fetchServiceCategories));
export const useCreateServiceCategory = serviceCategoryHooks.useCreate;
export const useUpdateServiceCategory = serviceCategoryHooks.useUpdate;
export const useDeleteServiceCategory = serviceCategoryHooks.useRemove;

// ==================== SERVICE POSITIONS ====================
const servicePositionHooks = createCrudHooks<ServicePositionFormData>({
  label: 'service position',
  invalidates: () => [queryKeys.servicePositions()],
  create: createServicePosition,
  update: updateServicePosition,
  remove: deleteServicePosition,
});
export const useServicePositions = () =>
  useListQuery(queryKeys.servicePositions(), () => fetchAllPages(fetchServicePositions));
export const useCreateServicePosition = servicePositionHooks.useCreate;
export const useUpdateServicePosition = servicePositionHooks.useUpdate;
export const useDeleteServicePosition = servicePositionHooks.useRemove;

// ==================== PUBLICATION INDICATORS ====================
const publicationIndicatorHooks = createCrudHooks<PublicationIndicatorFormData>({
  label: 'publication indicator',
  invalidates: () => [queryKeys.publicationIndicators()],
  create: createPublicationIndicator,
  update: updatePublicationIndicator,
  remove: deletePublicationIndicator,
});
export const usePublicationIndicators = () =>
  useListQuery(queryKeys.publicationIndicators(), () => fetchAllPages(fetchPublicationIndicators));
export const useCreatePublicationIndicator = publicationIndicatorHooks.useCreate;
export const useUpdatePublicationIndicator = publicationIndicatorHooks.useUpdate;
export const useDeletePublicationIndicator = publicationIndicatorHooks.useRemove;

// ==================== COMMITTEE MEMBERS ====================
const committeeHooks = createCrudHooks<CommitteeMemberFormData>({
  label: 'committee member',
  createdVerb: 'added',
  removedVerb: 'removed',
  invalidates: () => [queryKeys.committeeMembers()],
  create: createCommitteeMember,
  update: updateCommitteeMember,
  remove: deleteCommitteeMember,
});
export const useCommitteeMembers = () =>
  useListQuery(queryKeys.committeeMembers(), () => fetchAllPages(fetchCommitteeMembers));
export const useCreateCommitteeMember = committeeHooks.useCreate;
export const useUpdateCommitteeMember = committeeHooks.useUpdate;
export const useDeleteCommitteeMember = committeeHooks.useRemove;

// ==================== STAFF UPDATES ====================
const staffUpdateHooks = createCrudHooks<StaffUpdateFormData>({
  label: 'staff update',
  invalidates: () => [queryKeys.staffUpdates()],
  create: createStaffUpdate,
  update: updateStaffUpdate,
  remove: deleteStaffUpdate,
});
export const useStaffUpdates = (page = 1, pageSize = 10, search?: string) =>
  useQuery({
    queryKey: [...queryKeys.staffUpdates(), page, pageSize, search],
    queryFn: () => fetchStaffUpdates(page, pageSize, search),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
export const useCreateStaffUpdate = staffUpdateHooks.useCreate;
export const useUpdateStaffUpdate = staffUpdateHooks.useUpdate;
export const useDeleteStaffUpdate = staffUpdateHooks.useRemove;

// ==================== AUDIT LOGS ====================
export const useAuditLogs = (filters: AuditLogFilters = {}) =>
  useQuery({
    queryKey: queryKeys.auditLogs(filters),
    queryFn: () => fetchAuditLogs(filters),
    placeholderData: keepPreviousData,
  });

// ==================== NON-ACADEMIC COMMITTEES ====================
const nonAcademicCommitteeHooks = createCrudHooks<NonAcademicCommitteeMemberFormData>({
  label: 'committee member',
  createdVerb: 'added',
  removedVerb: 'removed',
  invalidates: () => [queryKeys.nonAcademicCommitteeMembers()],
  create: createNonAcademicCommitteeMember,
  update: updateNonAcademicCommitteeMember,
  remove: deleteNonAcademicCommitteeMember,
});
export const useNonAcademicCommitteeMembers = () =>
  useListQuery(queryKeys.nonAcademicCommitteeMembers(), () => fetchAllPages(fetchNonAcademicCommitteeMembers));
export const useCreateNonAcademicCommitteeMember = nonAcademicCommitteeHooks.useCreate;
export const useUpdateNonAcademicCommitteeMember = nonAcademicCommitteeHooks.useUpdate;
export const useDeleteNonAcademicCommitteeMember = nonAcademicCommitteeHooks.useRemove;

// ==================== NON-ACADEMIC POSITIONS ====================
const nonAcademicPositionHooks = createCrudHooks<NonAcademicPositionFormData>({
  label: 'position',
  invalidates: () => [queryKeys.nonAcademicPositions()],
  create: createNonAcademicPosition,
  update: updateNonAcademicPosition,
  remove: deleteNonAcademicPosition,
});
export const useNonAcademicPositions = () =>
  useListQuery(queryKeys.nonAcademicPositions(), () => fetchAllPages(fetchNonAcademicPositions));
export const useCreateNonAcademicPosition = nonAcademicPositionHooks.useCreate;
export const useUpdateNonAcademicPosition = nonAcademicPositionHooks.useUpdate;
export const useDeleteNonAcademicPosition = nonAcademicPositionHooks.useRemove;

// ==================== KNOWLEDGE MATERIAL INDICATORS ====================
const knowledgeIndicatorHooks = createCrudHooks<KnowledgeMaterialIndicatorFormData>({
  label: 'knowledge material indicator',
  invalidates: () => [queryKeys.knowledgeMaterialIndicators()],
  create: createKnowledgeMaterialIndicator,
  update: updateKnowledgeMaterialIndicator,
  remove: deleteKnowledgeMaterialIndicator,
});
export const useKnowledgeMaterialIndicators = () =>
  useListQuery(queryKeys.knowledgeMaterialIndicators(), () => fetchAllPages(fetchKnowledgeMaterialIndicators));
export const useCreateKnowledgeMaterialIndicator = knowledgeIndicatorHooks.useCreate;
export const useUpdateKnowledgeMaterialIndicator = knowledgeIndicatorHooks.useUpdate;
export const useDeleteKnowledgeMaterialIndicator = knowledgeIndicatorHooks.useRemove;

// ==================== ADMIN USERS ====================
const adminUserHooks = createCrudHooks<AdminUserFormData, Omit<AdminUserFormData, 'password'>>({
  label: 'admin',
  invalidates: () => [queryKeys.adminUsers()],
  create: createAdminUser,
  update: updateAdminUser,
  remove: deleteAdminUser,
});
export const useAdminUsers = () => useListQuery(queryKeys.adminUsers(), () => fetchAllPages(fetchAdminUsers));
export const useCreateAdminUser = adminUserHooks.useCreate;
export const useUpdateAdminUser = adminUserHooks.useUpdate;
export const useDeleteAdminUser = adminUserHooks.useRemove;
