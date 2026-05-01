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
  usePublicationIndicators,
  useCreatePublicationIndicator,
  useUpdatePublicationIndicator,
  useDeletePublicationIndicator,
} from '@/hooks/useAdminData';
import type { PublicationIndicator, PublicationIndicatorFormData } from '@/types';

export default function PublicationTypesPage() {
  const { data: indicators = [], isLoading } = usePublicationIndicators();
  const createMutation = useCreatePublicationIndicator();
  const updateMutation = useUpdatePublicationIndicator();
  const deleteMutation = useDeletePublicationIndicator();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<PublicationIndicator | null>(null);
  const [deletingIndicator, setDeletingIndicator] = useState<PublicationIndicator | null>(null);
  const [formData, setFormData] = useState<PublicationIndicatorFormData>({
    name: '',
    score: 0,
    scoreForPresentation: 0,
  });

  const handleOpenCreate = () => {
    setEditingIndicator(null);
    setFormData({ name: '', score: 0, scoreForPresentation: 0 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (indicator: PublicationIndicator) => {
    setEditingIndicator(indicator);
    setFormData({
      name: indicator.name,
      score: indicator.score,
      scoreForPresentation: indicator.scoreForPresentation,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (indicator: PublicationIndicator) => {
    setDeletingIndicator(indicator);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndicator) {
      await updateMutation.mutateAsync({ id: editingIndicator.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingIndicator) return;
    await deleteMutation.mutateAsync(deletingIndicator.id);
    setIsDeleteOpen(false);
  };

  const columns: Column<PublicationIndicator>[] = [
    { key: 'name', header: 'Name', className: 'font-medium' },
    {
      key: 'score',
      header: 'Score',
      className: 'text-center font-medium',
      render: (i) => i.score,
    },
    {
      key: 'scoreForPresentation',
      header: 'Presentation Score',
      className: 'text-center font-medium',
      render: (i) => i.scoreForPresentation,
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Publication Indicators"
        description="Manage publication types and scoring values"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Indicator
          </Button>
        }
      />

      <DataTable
        data={indicators}
        columns={columns}
        searchPlaceholder="Search publication indicators..."
        searchKeys={['name']}
        isLoading={isLoading}
        emptyMessage="No publication indicators found"
        actions={(indicator) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(indicator)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(indicator)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndicator ? 'Edit Publication Indicator' : 'Add Publication Indicator'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Refereed Journal Article"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="scoreForPresentation">Score for Presentation</Label>
                <Input
                  id="scoreForPresentation"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.scoreForPresentation}
                  onChange={(e) =>
                    setFormData({ ...formData, scoreForPresentation: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingIndicator ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Publication Indicator"
        description={`Are you sure you want to delete "${deletingIndicator?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
