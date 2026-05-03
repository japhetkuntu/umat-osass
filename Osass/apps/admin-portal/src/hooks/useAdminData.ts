import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  fetchSchools,
  fetchFaculties,
  fetchDepartments,
  fetchStaff,
  fetchAcademicPositions,
  fetchServicePositions,
  fetchPublicationIndicators,
  fetchCommitteeMembers,
  fetchStaffUpdates,
  fetchAuditLogs,
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
  fetchNonAcademicCommitteeMembers,
  createNonAcademicCommitteeMember,
  updateNonAcademicCommitteeMember,
  deleteNonAcademicCommitteeMember,
  fetchNonAcademicPositions,
  createNonAcademicPosition,
  updateNonAcademicPosition,
  deleteNonAcademicPosition,
  fetchKnowledgeMaterialIndicators,
  createKnowledgeMaterialIndicator,
  updateKnowledgeMaterialIndicator,
  deleteKnowledgeMaterialIndicator,
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '@/services/api';
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
  SchoolFormData,
  FacultyFormData,
  DepartmentFormData,
  StaffFormData,
  AcademicPositionFormData,
  ServicePositionFormData,
  PublicationIndicatorFormData,
  CommitteeMemberFormData,
  StaffUpdateFormData,
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

// Query keys
export const queryKeys = {
  schools: () => ['schools'],
  faculties: () => ['faculties'],
  departments: () => ['departments'],
  staff: (category?: string) => category ? ['staff', category] : ['staff'],
  academicPositions: () => ['academicPositions'],
  servicePositions: () => ['servicePositions'],
  publicationIndicators: () => ['publicationIndicators'],
  knowledgeMaterialIndicators: () => ['knowledgeMaterialIndicators'],
  committeeMembers: () => ['committeeMembers'],
  staffUpdates: () => ['staffUpdates'],
  auditLogs: (filters?: object) => ['auditLogs', filters],
  adminUsers: () => ['adminUsers'],
};

// ==================== SCHOOLS ====================
export const useSchools = () => {
  return useQuery({
    queryKey: queryKeys.schools(),
    queryFn: async () => {
      const data = await fetchSchools();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateSchool = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SchoolFormData) => createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools() });
      toast({ title: 'Success', description: 'School created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create school', variant: 'destructive' });
    },
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SchoolFormData }) =>
      updateSchool(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools() });
      toast({ title: 'Success', description: 'School updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update school', variant: 'destructive' });
    },
  });
};

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools() });
      toast({ title: 'Success', description: 'School deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete school', variant: 'destructive' });
    },
  });
};

// ==================== FACULTIES ====================
export const useFaculties = () => {
  return useQuery({
    queryKey: queryKeys.faculties(),
    queryFn: async () => {
      const data = await fetchFaculties();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFaculty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: FacultyFormData) => createFaculty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faculties() });
      queryClient.invalidateQueries({ queryKey: queryKeys.schools() });
      toast({ title: 'Success', description: 'Faculty created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create faculty', variant: 'destructive' });
    },
  });
};

export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FacultyFormData }) =>
      updateFaculty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faculties() });
      queryClient.invalidateQueries({ queryKey: queryKeys.schools() });
      toast({ title: 'Success', description: 'Faculty updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update faculty', variant: 'destructive' });
    },
  });
};

export const useDeleteFaculty = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteFaculty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faculties() });
      queryClient.invalidateQueries({ queryKey: queryKeys.schools() });
      toast({ title: 'Success', description: 'Faculty deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete faculty', variant: 'destructive' });
    },
  });
};

// ==================== DEPARTMENTS ====================
export const useDepartments = () => {
  return useQuery({
    queryKey: queryKeys.departments(),
    queryFn: async () => {
      const data = await fetchDepartments();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: DepartmentFormData) => createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.faculties() });
      toast({ title: 'Success', description: 'Department created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create department', variant: 'destructive' });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepartmentFormData }) =>
      updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.faculties() });
      toast({ title: 'Success', description: 'Department updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update department', variant: 'destructive' });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.faculties() });
      toast({ title: 'Success', description: 'Department deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete department', variant: 'destructive' });
    },
  });
};

// ==================== STAFF ====================
export const useStaff = (staffCategory?: string) => {
  return useQuery({
    queryKey: queryKeys.staff(staffCategory),
    queryFn: async () => {
      const data = await fetchStaff(1, 200, undefined, staffCategory);
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAcademicStaff = () => useStaff('Academic');
export const useNonAcademicStaff = () => useStaff('Non-Academic');

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: StaffFormData) => createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
      toast({ title: 'Success', description: 'Staff created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create staff', variant: 'destructive' });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StaffFormData }) => updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
      toast({ title: 'Success', description: 'Staff updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update staff', variant: 'destructive' });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff() });
      toast({ title: 'Success', description: 'Staff deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete staff', variant: 'destructive' });
    },
  });
};

// ==================== ACADEMIC POSITIONS ====================
export const useAcademicPositions = () => {
  return useQuery({
    queryKey: queryKeys.academicPositions(),
    queryFn: async () => {
      const data = await fetchAcademicPositions();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAcademicPosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: AcademicPositionFormData) => createAcademicPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicPositions() });
      toast({ title: 'Success', description: 'Academic position created successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create academic position',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateAcademicPosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AcademicPositionFormData }) =>
      updateAcademicPosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicPositions() });
      toast({ title: 'Success', description: 'Academic position updated successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update academic position',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteAcademicPosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteAcademicPosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicPositions() });
      toast({ title: 'Success', description: 'Academic position deleted successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete academic position',
        variant: 'destructive',
      });
    },
  });
};

// ==================== SERVICE POSITIONS ====================
export const useServicePositions = () => {
  return useQuery({
    queryKey: queryKeys.servicePositions(),
    queryFn: async () => {
      const data = await fetchServicePositions();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateServicePosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ServicePositionFormData) => createServicePosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.servicePositions() });
      toast({ title: 'Success', description: 'Service position created successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create service position',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateServicePosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServicePositionFormData }) =>
      updateServicePosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.servicePositions() });
      toast({ title: 'Success', description: 'Service position updated successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update service position',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteServicePosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteServicePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.servicePositions() });
      toast({ title: 'Success', description: 'Service position deleted successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete service position',
        variant: 'destructive',
      });
    },
  });
};

// ==================== PUBLICATION INDICATORS ====================
export const usePublicationIndicators = () => {
  return useQuery({
    queryKey: queryKeys.publicationIndicators(),
    queryFn: async () => {
      const data = await fetchPublicationIndicators();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePublicationIndicator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PublicationIndicatorFormData) => createPublicationIndicator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicationIndicators() });
      toast({ title: 'Success', description: 'Publication indicator created successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create publication indicator',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePublicationIndicator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PublicationIndicatorFormData }) =>
      updatePublicationIndicator(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicationIndicators() });
      toast({ title: 'Success', description: 'Publication indicator updated successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update publication indicator',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePublicationIndicator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deletePublicationIndicator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicationIndicators() });
      toast({ title: 'Success', description: 'Publication indicator deleted successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete publication indicator',
        variant: 'destructive',
      });
    },
  });
};

// ==================== COMMITTEE MEMBERS ====================
export const useCommitteeMembers = () => {
  return useQuery({
    queryKey: queryKeys.committeeMembers(),
    queryFn: async () => {
      const data = await fetchCommitteeMembers();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCommitteeMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CommitteeMemberFormData) => createCommitteeMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.committeeMembers() });
      toast({ title: 'Success', description: 'Committee member added successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add committee member',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCommitteeMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommitteeMemberFormData }) =>
      updateCommitteeMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.committeeMembers() });
      toast({ title: 'Success', description: 'Committee member updated successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update committee member',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCommitteeMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteCommitteeMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.committeeMembers() });
      toast({ title: 'Success', description: 'Committee member removed successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove committee member',
        variant: 'destructive',
      });
    },
  });
};

// ==================== STAFF UPDATES ====================
export const useStaffUpdates = (page = 1, pageSize = 10, search?: string) => {
  return useQuery({
    queryKey: queryKeys.staffUpdates().concat([page, pageSize, search]),
    queryFn: async () => {
      return await fetchStaffUpdates(page, pageSize, search);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateStaffUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: StaffUpdateFormData) => createStaffUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staffUpdates() });
      toast({ title: 'Success', description: 'Staff update created successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create staff update',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateStaffUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StaffUpdateFormData }) =>
      updateStaffUpdate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staffUpdates() });
      toast({ title: 'Success', description: 'Staff update updated successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update staff update',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteStaffUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteStaffUpdate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staffUpdates() });
      toast({ title: 'Success', description: 'Staff update deleted successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete staff update',
        variant: 'destructive',
      });
    },
  });
};

// ==================== AUDIT LOGS ====================
export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.auditLogs(filters),
    queryFn: () => fetchAuditLogs(filters),
  });
};

// ==================== NON-ACADEMIC COMMITTEES ====================
export const useNonAcademicCommitteeMembers = () => {
  return useQuery({
    queryKey: ['nonAcademicCommitteeMembers'],
    queryFn: async () => {
      const data = await fetchNonAcademicCommitteeMembers();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateNonAcademicCommitteeMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: NonAcademicCommitteeMemberFormData) => createNonAcademicCommitteeMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonAcademicCommitteeMembers'] });
      toast({ title: 'Success', description: 'Committee member added successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add committee member', variant: 'destructive' });
    },
  });
};

export const useUpdateNonAcademicCommitteeMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NonAcademicCommitteeMemberFormData }) =>
      updateNonAcademicCommitteeMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonAcademicCommitteeMembers'] });
      toast({ title: 'Success', description: 'Committee member updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update committee member', variant: 'destructive' });
    },
  });
};

export const useDeleteNonAcademicCommitteeMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteNonAcademicCommitteeMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonAcademicCommitteeMembers'] });
      toast({ title: 'Success', description: 'Committee member removed successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove committee member', variant: 'destructive' });
    },
  });
};

// ==================== NON-ACADEMIC POSITIONS ====================
export const useNonAcademicPositions = () => {
  return useQuery({
    queryKey: ['nonAcademicPositions'],
    queryFn: async () => {
      const data = await fetchNonAcademicPositions();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateNonAcademicPosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: NonAcademicPositionFormData) => createNonAcademicPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonAcademicPositions'] });
      toast({ title: 'Success', description: 'Position created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create position', variant: 'destructive' });
    },
  });
};

export const useUpdateNonAcademicPosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NonAcademicPositionFormData }) =>
      updateNonAcademicPosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonAcademicPositions'] });
      toast({ title: 'Success', description: 'Position updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update position', variant: 'destructive' });
    },
  });
};

export const useDeleteNonAcademicPosition = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteNonAcademicPosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nonAcademicPositions'] });
      toast({ title: 'Success', description: 'Position deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete position', variant: 'destructive' });
    },
  });
};

// ==================== KNOWLEDGE MATERIAL INDICATORS ====================
export const useKnowledgeMaterialIndicators = () => {
  return useQuery({
    queryKey: queryKeys.knowledgeMaterialIndicators(),
    queryFn: async () => {
      const data = await fetchKnowledgeMaterialIndicators();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateKnowledgeMaterialIndicator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: KnowledgeMaterialIndicatorFormData) => createKnowledgeMaterialIndicator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeMaterialIndicators() });
      toast({ title: 'Success', description: 'Knowledge material indicator created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create knowledge material indicator', variant: 'destructive' });
    },
  });
};

export const useUpdateKnowledgeMaterialIndicator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: KnowledgeMaterialIndicatorFormData }) =>
      updateKnowledgeMaterialIndicator(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeMaterialIndicators() });
      toast({ title: 'Success', description: 'Knowledge material indicator updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update knowledge material indicator', variant: 'destructive' });
    },
  });
};

export const useDeleteKnowledgeMaterialIndicator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteKnowledgeMaterialIndicator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeMaterialIndicators() });
      toast({ title: 'Success', description: 'Knowledge material indicator deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete knowledge material indicator', variant: 'destructive' });
    },
  });
};

// ==================== ADMIN USERS ====================
export const useAdminUsers = () => {
  return useQuery({
    queryKey: queryKeys.adminUsers(),
    queryFn: async () => {
      const data = await fetchAdminUsers();
      return data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: AdminUserFormData) => createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
      toast({ title: 'Success', description: 'Admin created successfully' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message || 'Failed to create admin', variant: 'destructive' });
    },
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<AdminUserFormData, 'password'> }) =>
      updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
      toast({ title: 'Success', description: 'Admin updated successfully' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message || 'Failed to update admin', variant: 'destructive' });
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
      toast({ title: 'Success', description: 'Admin deleted successfully' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message || 'Failed to delete admin', variant: 'destructive' });
    },
  });
};
