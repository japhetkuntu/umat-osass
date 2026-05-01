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
  useDepartments,
  useFaculties,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/hooks/useAdminData';
import type { Department, DepartmentFormData } from '@/types';

const emptyForm: DepartmentFormData = {
  name: '',
  facultyId: '',
  departmentType: 'academic',
};

export default function DepartmentsPage() {
  const { data: allDepartments = [], isLoading } = useDepartments();
  const { data: faculties = [] } = useFaculties();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  // Only show academic departments on this page
  const departments = allDepartments.filter(
    (d) => !d.departmentType || d.departmentType.toLowerCase() === 'academic',
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({ ...emptyForm });

  const handleOpenCreate = () => {
    setEditingDepartment(null);
    setFormData({ ...emptyForm });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      facultyId: department.facultyId || '',
      departmentType: 'academic',
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (department: Department) => {
    setDeletingDepartment(department);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: DepartmentFormData = { ...formData, departmentType: 'academic' };
    if (editingDepartment) {
      await updateMutation.mutateAsync({ id: editingDepartment.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingDepartment) return;
    await deleteMutation.mutateAsync(deletingDepartment.id);
    setIsDeleteOpen(false);
  };

  const columns: Column<Department>[] = [
    { key: 'name', header: 'Name', className: 'font-medium' },
    { key: 'facultyName', header: 'Faculty' },
    { key: 'schoolName', header: 'School' },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Academic Departments"
        description="Manage academic departments within faculties"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        }
      />

      <DataTable
        data={departments}
        columns={columns}
        searchPlaceholder="Search departments..."
        searchKeys={['name', 'facultyName', 'schoolName']}
        isLoading={isLoading}
        emptyMessage="No academic departments found"
        actions={(department) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(department)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(department)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Faculty</Label>
              <Select
                value={formData.facultyId || ''}
                onValueChange={(value) => setFormData({ ...formData, facultyId: value })}
              >
                <SelectTrigger><SelectValue placeholder="Select a faculty" /></SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingDepartment ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Department"
        description={`Are you sure you want to delete "${deletingDepartment?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
