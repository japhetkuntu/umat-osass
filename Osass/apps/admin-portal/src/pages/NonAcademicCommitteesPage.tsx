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
  useNonAcademicCommitteeMembers,
  useStaff,
  useDepartments,
  useCreateNonAcademicCommitteeMember,
  useUpdateNonAcademicCommitteeMember,
  useDeleteNonAcademicCommitteeMember,
} from '@/hooks/useAdminData';
import type { NonAcademicCommitteeMember, NonAcademicCommitteeMemberFormData } from '@/types';

const COMMITTEE_TYPES = ['HOU', 'AAPSC', 'UAPC'];

const COMMITTEE_LABELS: Record<string, string> = {
  HOU: 'Head of Unit',
  AAPSC: 'Administrative & Allied Professions Sub-Committee',
  UAPC: 'University Academic Promotions Committee',
};

const emptyForm: NonAcademicCommitteeMemberFormData = {
  staffId: '',
  committeeType: 'HOU',
  canSubmitReviewedApplication: false,
  isChairperson: false,
  unitId: '',
};

export default function NonAcademicCommitteesPage() {
  const { data: members = [], isLoading } = useNonAcademicCommitteeMembers();
  const { data: staffList = [] } = useStaff();
  const { data: departments = [] } = useDepartments();
  const createMutation = useCreateNonAcademicCommitteeMember();
  const updateMutation = useUpdateNonAcademicCommitteeMember();
  const deleteMutation = useDeleteNonAcademicCommitteeMember();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<NonAcademicCommitteeMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<NonAcademicCommitteeMember | null>(null);
  const [formData, setFormData] = useState<NonAcademicCommitteeMemberFormData>({ ...emptyForm });

  // Filter to non-academic departments/units for the unitId selector
  const nonAcademicUnits = departments.filter(
    (d) => d.departmentType?.toLowerCase() === 'non-academic',
  );

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({ ...emptyForm });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member: NonAcademicCommitteeMember) => {
    setEditingMember(member);
    setFormData({
      staffId: member.staffId,
      committeeType: member.committeeType,
      canSubmitReviewedApplication: member.canSubmitReviewedApplication,
      isChairperson: member.isChairperson,
      unitId: member.unitId || '',
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (member: NonAcademicCommitteeMember) => {
    setDeletingMember(member);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: NonAcademicCommitteeMemberFormData = {
      ...formData,
      unitId: formData.unitId || undefined,
    };
    if (editingMember) {
      await updateMutation.mutateAsync({ id: editingMember.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    await deleteMutation.mutateAsync(deletingMember.id);
    setIsDeleteOpen(false);
  };

  const getStaffName = (staffId: string) => {
    const s = staffList.find((st) => st.id === staffId);
    return s ? `${s.title ? s.title + ' ' : ''}${s.firstName} ${s.lastName}` : staffId;
  };

  const getUnitName = (unitId?: string) => {
    if (!unitId) return '—';
    const d = departments.find((d) => d.id === unitId);
    return d?.name ?? unitId;
  };

  const columns: Column<NonAcademicCommitteeMember>[] = [
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
      render: (m) => (m.isChairperson ? 'Yes' : 'No'),
    },
    {
      key: 'canSubmitReviewedApplication',
      header: 'Can Submit',
      className: 'text-center',
      render: (m) => (m.canSubmitReviewedApplication ? 'Yes' : 'No'),
    },
    {
      key: 'unitId',
      header: 'Unit (for HOU)',
      render: (m) => getUnitName(m.unitId),
    },
  ];

  // Auto-fill unitId when a staff member is selected
  const handleStaffChange = (staffId: string) => {
    const s = staffList.find((st) => st.id === staffId);
    setFormData((prev) => ({
      ...prev,
      staffId,
      unitId: s?.departmentId || prev.unitId,
    }));
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Non-Academic Committees"
        description="Manage HOU, AAPSC, and UAPC committee members for non-academic staff promotions"
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
        searchKeys={['staffName', 'committeeType']}
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
              <Select value={formData.staffId} onValueChange={handleStaffChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title ? s.title + ' ' : ''}
                      {s.firstName} {s.lastName} ({s.staffId})
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
                    <SelectItem key={type} value={type}>
                      {type} — {COMMITTEE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.committeeType === 'HOU' && (
              <div className="space-y-2">
                <Label htmlFor="unitId">Unit (for HOU)</Label>
                <Select
                  value={formData.unitId || ''}
                  onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {nonAcademicUnits.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                    {nonAcademicUnits.length === 0 &&
                      departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                  Can Submit Review
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingMember ? 'Update' : 'Add Member'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Remove Committee Member"
        description={`Are you sure you want to remove ${deletingMember?.staffName || 'this member'} from the committee? This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
