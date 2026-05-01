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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useNonAcademicStaff,
  useNonAcademicPositions,
  useDepartments,
  useSchools,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
} from '@/hooks/useAdminData';
import type { Staff, StaffFormData } from '@/types';

const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];

const emptyForm: StaffFormData = {
  email: '',
  firstName: '',
  lastName: '',
  staffId: '',
  position: '',
  previousPosition: '__none__',
  lastAppointmentOrPromotionDate: '',
  title: '',
  staffCategory: 'Non-Academic',
  universityRole: '',
  departmentId: '',
  schoolId: '',
};

export default function NonAcademicStaffPage() {
  const { data: staff = [], isLoading } = useNonAcademicStaff();
  const { data: positions = [] } = useNonAcademicPositions();
  const { data: allDepartments = [] } = useDepartments();
  const { data: schools = [] } = useSchools();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();

  // Only show non-academic units/sections in the dropdown
  const units = allDepartments.filter(
    (d) => d.departmentType?.toLowerCase() === 'non-academic',
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({ ...emptyForm });

  const positionNames = positions.map((p) => p.name);

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormData({ ...emptyForm });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      staffId: member.staffId,
      position: member.position,
      previousPosition: member.previousPosition || '__none__',
      lastAppointmentOrPromotionDate: member.lastAppointmentOrPromotionDate?.split('T')[0] || '',
      title: member.title,
      staffCategory: 'Non-Academic',
      universityRole: member.universityRole || '',
      departmentId: member.departmentId,
      schoolId: member.schoolId,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (member: Staff) => {
    setDeletingStaff(member);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: StaffFormData = {
      ...formData,
      staffCategory: 'Non-Academic',
      previousPosition: formData.previousPosition === '__none__' ? '' : formData.previousPosition,
    };
    if (editingStaff) {
      await updateMutation.mutateAsync({ id: editingStaff.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingStaff) return;
    await deleteMutation.mutateAsync(deletingStaff.id);
    setIsDeleteOpen(false);
  };

  const handleUnitChange = (unitId: string) => {
    const unit = units.find((d) => d.id === unitId);
    setFormData({
      ...formData,
      departmentId: unitId,
      schoolId: unit?.schoolId || formData.schoolId,
    });
  };

  const columns: Column<Staff>[] = [
    {
      key: 'name',
      header: 'Name',
      className: 'font-medium',
      render: (m) => `${m.title ? m.title + ' ' : ''}${m.firstName} ${m.lastName}`,
    },
    { key: 'staffId', header: 'Staff ID' },
    { key: 'email', header: 'Email' },
    { key: 'position', header: 'Position' },
    { key: 'departmentName', header: 'Unit/Section' },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Non-Academic Staff"
        description="Manage non-academic staff members"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Non-Academic Staff
          </Button>
        }
      />

      <DataTable
        data={staff}
        columns={columns}
        searchPlaceholder="Search non-academic staff..."
        searchKeys={['firstName', 'lastName', 'email', 'staffId', 'position']}
        isLoading={isLoading}
        emptyMessage="No non-academic staff found"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Non-Academic Staff' : 'Add Non-Academic Staff'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Select
                  value={formData.title}
                  onValueChange={(value) => setFormData({ ...formData, title: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Title" /></SelectTrigger>
                  <SelectContent>
                    {TITLES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffId">Staff ID</Label>
                <Input
                  id="staffId"
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                  <SelectContent>
                    {positionNames.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Previous Position</Label>
                <Select
                  value={formData.previousPosition || '__none__'}
                  onValueChange={(value) => setFormData({ ...formData, previousPosition: value })}
                >
                  <SelectTrigger><SelectValue placeholder="None / not applicable" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None / not applicable</SelectItem>
                    {positionNames.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastAppointment">Last Appointment / Promotion Date</Label>
              <Input
                id="lastAppointment"
                type="date"
                value={formData.lastAppointmentOrPromotionDate}
                onChange={(e) =>
                  setFormData({ ...formData, lastAppointmentOrPromotionDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="universityRole">University Role (optional)</Label>
              <Input
                id="universityRole"
                value={formData.universityRole}
                onChange={(e) => setFormData({ ...formData, universityRole: e.target.value })}
                placeholder="e.g., Registrar, Bursar"
              />
            </div>

            <div className="space-y-2">
              <Label>Unit / Section</Label>
              {units.length === 0 ? (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800 px-3 py-2 text-sm text-yellow-800 dark:text-yellow-300">
                  No units/sections configured.{' '}
                  <a href="/units-sections" className="underline font-medium" onClick={() => setIsFormOpen(false)}>
                    Add units/sections here first.
                  </a>
                </div>
              ) : (
                <Select value={formData.departmentId} onValueChange={handleUnitChange}>
                  <SelectTrigger><SelectValue placeholder="Select a unit/section" /></SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.schoolName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>School</Label>
              <Select
                value={formData.schoolId}
                onValueChange={(value) => setFormData({ ...formData, schoolId: value })}
              >
                <SelectTrigger><SelectValue placeholder="Select a school" /></SelectTrigger>
                <SelectContent>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingStaff ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Non-Academic Staff"
        description={`Are you sure you want to delete "${deletingStaff?.firstName} ${deletingStaff?.lastName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
