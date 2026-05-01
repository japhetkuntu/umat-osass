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
  useFaculties,
  useSchools,
  useCreateFaculty,
  useUpdateFaculty,
  useDeleteFaculty,
} from '@/hooks/useAdminData';
import type { Faculty, School, FacultyFormData } from '@/types';

export default function FacultiesPage() {
  const { data: faculties = [], isLoading } = useFaculties();
  const { data: schools = [] } = useSchools();
  const createMutation = useCreateFaculty();
  const updateMutation = useUpdateFaculty();
  const deleteMutation = useDeleteFaculty();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState<FacultyFormData>({ name: '', schoolId: '' });

  const handleOpenCreate = () => {
    setEditingFaculty(null);
    setFormData({ name: '', schoolId: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setFormData({ name: faculty.name, schoolId: faculty.schoolId });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (faculty: Faculty) => {
    setDeletingFaculty(faculty);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaculty) {
      await updateMutation.mutateAsync({ id: editingFaculty.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingFaculty) return;
    await deleteMutation.mutateAsync(deletingFaculty.id);
    setIsDeleteOpen(false);
  };

  const columns: Column<Faculty>[] = [
    { key: 'name', header: 'Name', className: 'font-medium' },
    { key: 'schoolName', header: 'School' },
    {
      key: 'createdAt',
      header: 'Created',
      render: (f) => new Date(f.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Faculties"
        description="Manage university faculties"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Faculty
          </Button>
        }
      />

      <DataTable
        data={faculties}
        columns={columns}
        searchPlaceholder="Search faculties..."
        searchKeys={['name', 'schoolName']}
        isLoading={isLoading}
        emptyMessage="No faculties found"
        actions={(faculty) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(faculty)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(faculty)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaculty ? 'Edit Faculty' : 'Add Faculty'}</DialogTitle>
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
              <Label htmlFor="school">School</Label>
              <Select
                value={formData.schoolId}
                onValueChange={(value) => setFormData({ ...formData, schoolId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingFaculty ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Faculty"
        description={`Are you sure you want to delete "${deletingFaculty?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
