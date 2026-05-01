import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCommitteeMembers,
  useStaff,
  useDepartments,
  useFaculties,
  useSchools,
  useCreateCommitteeMember,
  useUpdateCommitteeMember,
  useDeleteCommitteeMember,
} from '@/hooks/useAdminData';
import type { CommitteeMember, CommitteeMemberFormData } from '@/types';

const COMMITTEE_TYPES = ['DAPC', 'FAPSC', 'UAPC'];

const emptyForm: CommitteeMemberFormData = {
  staffId: '',
  committeeType: 'DAPC',
  canSubmitReviewedApplication: false,
  isChairperson: false,
  departmentId: '',
  facultyId: '',
  schoolId: '',
};

export default function CommitteesPage() {
  const { data: members = [], isLoading } = useCommitteeMembers();
  const { data: staffList = [] } = useStaff();
  const { data: departments = [] } = useDepartments();
  const { data: faculties = [] } = useFaculties();
  const { data: schools = [] } = useSchools();
  const createMutation = useCreateCommitteeMember();
  const updateMutation = useUpdateCommitteeMember();
  const deleteMutation = useDeleteCommitteeMember();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<CommitteeMember | null>(null);
  const [formData, setFormData] = useState<CommitteeMemberFormData>({ ...emptyForm });

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({ ...emptyForm });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member: CommitteeMember) => {
    setEditingMember(member);
    setFormData({
      staffId: member.staffId,
      committeeType: member.committeeType,
      canSubmitReviewedApplication: member.canSubmitReviewedApplication,
      isChairperson: member.isChairperson,
      departmentId: member.departmentId || '',
      facultyId: member.facultyId || '',
      schoolId: member.schoolId || '',
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (member: CommitteeMember) => {
    setDeletingMember(member);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      await updateMutation.mutateAsync({ id: editingMember.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    await deleteMutation.mutateAsync(deletingMember.id);
    setIsDeleteOpen(false);
  };

  // Get staff name for display
  const getStaffName = (staffId: string) => {
    const s = staffList.find((st) => st.id === staffId);
    return s ? `${s.title ? s.title + ' ' : ''}${s.firstName} ${s.lastName}` : staffId;
  };

  const columns: Column<CommitteeMember>[] = [
    {
      key: 'staffId',
      header: 'Staff Member',
      className: 'font-medium',
      render: (m) => m.staffName || getStaffName(m.staffId),
    },
    {
      key: 'committeeType',
      header: 'Committee',
      render: (m) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {m.committeeType}
        </span>
      ),
    },
    {
      key: 'isChairperson',
      header: 'Chairperson',
      className: 'text-center',
      render: (m) => m.isChairperson ? 'Yes' : 'No',
    },
    {
      key: 'canSubmitReviewedApplication',
      header: 'Can Submit',
      className: 'text-center',
      render: (m) => m.canSubmitReviewedApplication ? 'Yes' : 'No',
    },
    { key: 'departmentName', header: 'Department' },
    { key: 'facultyName', header: 'Faculty' },
  ];

  // Auto-fill scope fields when staff is selected
  const handleStaffChange = (staffId: string) => {
    const s = staffList.find((st) => st.id === staffId);
    setFormData({
      ...formData,
      staffId,
      departmentId: s?.departmentId || formData.departmentId,
      facultyId: s?.facultyId || formData.facultyId,
      schoolId: s?.schoolId || formData.schoolId,
    });
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Committees"
        description="Manage promotion committee members and assignments"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        }
      />

      <DataTable
        data={members}
        columns={columns}
        searchPlaceholder="Search committee members..."
        searchKeys={['staffName', 'committeeType', 'departmentName', 'facultyName']}
        isLoading={isLoading}
        emptyMessage="No committee members found"
        actions={(member) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(member)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(member)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Edit Committee Member' : 'Add Committee Member'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Staff Member</Label>
              <Select
                value={formData.staffId}
                onValueChange={handleStaffChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title ? s.title + ' ' : ''}{s.firstName} {s.lastName} ({s.staffId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="committeeType">Committee Type</Label>
              <Select
                value={formData.committeeType}
                onValueChange={(value) => setFormData({ ...formData, committeeType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMITTEE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department (for DAPC)</Label>
              <Select
                value={formData.departmentId || ''}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty (for FAPSC)</Label>
                <Select
                  value={formData.facultyId || ''}
                  onValueChange={(value) => setFormData({ ...formData, facultyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School (for UAPC)</Label>
                <Select
                  value={formData.schoolId || ''}
                  onValueChange={(value) => setFormData({ ...formData, schoolId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isChairperson"
                  checked={formData.isChairperson}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isChairperson: !!checked })
                  }
                />
                <Label htmlFor="isChairperson" className="cursor-pointer">
                  Is Chairperson
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="canSubmit"
                  checked={formData.canSubmitReviewedApplication}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canSubmitReviewedApplication: !!checked })
                  }
                />
                <Label htmlFor="canSubmit" className="cursor-pointer">
                  Can Submit Reviewed Applications
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingMember ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Remove Committee Member"
        description={`Are you sure you want to remove this committee member? This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
