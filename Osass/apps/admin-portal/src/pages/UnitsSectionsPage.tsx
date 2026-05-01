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
  useSchools,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/hooks/useAdminData';
import type { Department, DepartmentFormData } from '@/types';

const emptyForm: DepartmentFormData = {
  name: '',
  schoolId: '',
  departmentType: 'non-academic',
};

export default function UnitsSectionsPage() {
  const { data: allDepartments = [], isLoading } = useDepartments();
  const { data: schools = [] } = useSchools();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const units = allDepartments.filter(
    (d) => d.departmentType?.toLowerCase() === 'non-academic',
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Department | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({ ...emptyForm });

  const handleOpenCreate = () => {
    setEditingUnit(null);
    setFormData({ ...emptyForm });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (unit: Department) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      schoolId: unit.schoolId || '',
      departmentType: 'non-academic',
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (unit: Department) => {
    setDeletingUnit(unit);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolId) {
      alert('Please select a school.');
      return;
    }
    const payload: DepartmentFormData = { ...formData, departmentType: 'non-academic' };
    if (editingUnit) {
      await updateMutation.mutateAsync({ id: editingUnit.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingUnit) return;
    await deleteMutation.mutateAsync(deletingUnit.id);
    setIsDeleteOpen(false);
  };

  const columns: Column<Department>[] = [
    { key: 'name', header: 'Unit / Section', className: 'font-medium' },
    { key: 'schoolName', header: 'School' },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Units & Sections"
        description="Manage non-academic units and sections"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit / Section
          </Button>
        }
      />

      <DataTable
        data={units}
        columns={columns}
        searchPlaceholder="Search units & sections..."
        searchKeys={['name', 'schoolName']}
        isLoading={isLoading}
        emptyMessage="No units or sections found"
        actions={(unit) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(unit)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(unit)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Edit Unit / Section' : 'Add Unit / Section'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Registry, Finance Office"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>School</Label>
              <Select
                value={formData.schoolId || ''}
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
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingUnit ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Unit / Section"
        description={`Are you sure you want to delete "${deletingUnit?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
