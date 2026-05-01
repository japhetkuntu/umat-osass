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
  useStaff,
  useDepartments,
  useFaculties,
  useSchools,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
} from '@/hooks/useAdminData';
import type { Staff, Department, Faculty, School, StaffFormData } from '@/types';

const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
const STAFF_CATEGORIES = ['Academic', 'Non-Academic'];

const emptyForm: StaffFormData = {
  email: '',
  firstName: '',
  lastName: '',
  staffId: '',
  position: '',
  previousPosition: '__none__',
  lastAppointmentOrPromotionDate: '',
  title: '',
  staffCategory: 'Academic',
  universityRole: '',
  departmentId: '',
  facultyId: '',
  schoolId: '',
};

export default function StaffPage() {
  const { data: staff = [], isLoading } = useStaff();
  const { data: departments = [] } = useDepartments();
  const { data: faculties = [] } = useFaculties();
  const { data: schools = [] } = useSchools();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({ ...emptyForm });

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
      staffCategory: member.staffCategory,
      universityRole: member.universityRole || '',
      departmentId: member.departmentId,
      facultyId: member.facultyId,
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
    const payload: typeof formData = {
      ...formData,
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

  // Auto-fill faculty/school when department is selected
  const handleDepartmentChange = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    setFormData({
      ...formData,
      departmentId: deptId,
      facultyId: dept?.facultyId || formData.facultyId,
      schoolId: dept?.schoolId || formData.schoolId,
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
    { key: 'staffCategory', header: 'Category' },
    { key: 'departmentName', header: 'Department' },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Staff"
        description="Manage university staff members"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        }
      />

      <DataTable
        data={staff}
        columns={columns}
        searchPlaceholder="Search staff..."
        searchKeys={['firstName', 'lastName', 'email', 'staffId', 'position']}
        isLoading={isLoading}
        emptyMessage="No staff found"
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
            <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Select
                  value={formData.title}
                  onValueChange={(value) => setFormData({ ...formData, title: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Title" />
                  </SelectTrigger>
                  <SelectContent>
                    {TITLES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
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
                <Label htmlFor="position">Current Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assistant Lecturer">Assistant Lecturer</SelectItem>
                    <SelectItem value="Assistant Research Fellow">Assistant Research Fellow</SelectItem>

                    <SelectItem value="Research Fellow">Research Fellow</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>

                    <SelectItem value="Senior Research Fellow">Senior Research Fellow</SelectItem>
                    <SelectItem value="Senior Lecturer">Senior Lecturer</SelectItem>

                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                    <SelectItem value="Professor">Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousPosition">Previous Position</Label>
                <Select
                  value={formData.previousPosition || '__none__'}
                  onValueChange={(value) => setFormData({ ...formData, previousPosition: value })}
                >
                  <SelectTrigger id="previousPosition">
                    <SelectValue placeholder="None / not applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None / not applicable</SelectItem>
                    <SelectItem value="Assistant Lecturer">Assistant Lecturer</SelectItem>
                    <SelectItem value="Assistant Research Fellow">Assistant Research Fellow</SelectItem>

                    <SelectItem value="Research Fellow">Research Fellow</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>

                    <SelectItem value="Senior Research Fellow">Senior Research Fellow</SelectItem>
                    <SelectItem value="Senior Lecturer">Senior Lecturer</SelectItem>

                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffCategory">Staff Category</Label>
                <Select
                  value={formData.staffCategory}
                  onValueChange={(value) => setFormData({ ...formData, staffCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="universityRole">University Role (optional)</Label>
              <Input
                id="universityRole"
                value={formData.universityRole}
                onChange={(e) => setFormData({ ...formData, universityRole: e.target.value })}
                placeholder="e.g., Vice Chancellor, Pro Vice Chancellor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.facultyName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select
                  value={formData.facultyId}
                  onValueChange={(value) => setFormData({ ...formData, facultyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={(value) => setFormData({ ...formData, schoolId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
        title="Delete Staff"
        description={`Are you sure you want to delete "${deletingStaff?.firstName} ${deletingStaff?.lastName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
