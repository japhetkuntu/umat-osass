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
  useServicePositions,
  useServiceCategories,
  useCreateServicePosition,
  useUpdateServicePosition,
  useDeleteServicePosition,
} from '@/hooks/useAdminData';
import type { ServicePosition, ServicePositionFormData } from '@/types';

export default function ServicePositionsPage() {
  const { data: positions = [], isLoading, isError, refetch } = useServicePositions();
  const { data: categories = [] } = useServiceCategories();
  const createMutation = useCreateServicePosition();
  const updateMutation = useUpdateServicePosition();
  const deleteMutation = useDeleteServicePosition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<ServicePosition | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<ServicePosition | null>(null);
  const [formData, setFormData] = useState<ServicePositionFormData>({
    name: '',
    score: 0,
    categoryId: '',
  });

  const handleOpenCreate = () => {
    setEditingPosition(null);
    setFormData({ name: '', score: 0, categoryId: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (position: ServicePosition) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      score: position.score,
      categoryId: position.categoryId,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (position: ServicePosition) => {
    setDeletingPosition(position);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPosition) {
      await updateMutation.mutateAsync({ id: editingPosition.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingPosition) return;
    await deleteMutation.mutateAsync(deletingPosition.id);
    setIsDeleteOpen(false);
  };

  const columns: Column<ServicePosition>[] = [
    { key: 'name', header: 'Name', className: 'font-medium' },
    { key: 'categoryName', header: 'Category' },
    {
      key: 'score',
      header: 'Score',
      className: 'text-center font-medium',
      render: (p) => p.score,
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Service Positions"
        description="Manage service positions and scoring values"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Position
          </Button>
        }
      />

      <DataTable
        data={positions}
        columns={columns}
        searchPlaceholder="Search positions..."
        searchKeys={['name', 'categoryName']}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyMessage="No service positions found"
        actions={(position) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" aria-label={`Edit ${position.name}`} onClick={() => handleOpenEdit(position)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`Delete ${position.name}`} onClick={() => handleOpenDelete(position)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPosition ? 'Edit Service Position' : 'Add Service Position'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Department Head"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.categoryId}>{editingPosition ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Service Position"
        description={`Are you sure you want to delete "${deletingPosition?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
