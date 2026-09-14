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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useServiceCategories,
  useCreateServiceCategory,
  useUpdateServiceCategory,
  useDeleteServiceCategory,
} from '@/hooks/useAdminData';
import type { ServiceCategory, ServiceCategoryFormData } from '@/types';

const emptyForm: ServiceCategoryFormData = {
  name: '',
  description: '',
  requiresDesignation: false,
  requiresCommitteeName: true,
  actingScoreMultiplier: 0.5,
  fullTimeScoreMultiplier: 1.0,
  displayOrder: 0,
};

export default function ServiceCategoriesPage() {
  const { data: categories = [], isLoading, isError, refetch } = useServiceCategories();
  const createMutation = useCreateServiceCategory();
  const updateMutation = useUpdateServiceCategory();
  const deleteMutation = useDeleteServiceCategory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ServiceCategory | null>(null);
  const [formData, setFormData] = useState<ServiceCategoryFormData>({ ...emptyForm });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ ...emptyForm, displayOrder: categories.length + 1 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: ServiceCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      requiresDesignation: category.requiresDesignation,
      requiresCommitteeName: category.requiresCommitteeName,
      actingScoreMultiplier: category.actingScoreMultiplier,
      fullTimeScoreMultiplier: category.fullTimeScoreMultiplier,
      displayOrder: category.displayOrder,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (category: ServiceCategory) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    await deleteMutation.mutateAsync(deletingCategory.id);
    setIsDeleteOpen(false);
  };

  const columns: Column<ServiceCategory>[] = [
    { key: 'displayOrder', header: 'Order', className: 'text-center w-16' },
    { key: 'name', header: 'Name', className: 'font-medium' },
    {
      key: 'requiresDesignation',
      header: 'Designation',
      className: 'text-center',
      render: (c) => c.requiresDesignation ? 'Yes' : 'No',
    },
    {
      key: 'requiresCommitteeName',
      header: 'Committee Name',
      className: 'text-center',
      render: (c) => c.requiresCommitteeName ? 'Yes' : 'No',
    },
    {
      key: 'actingScoreMultiplier',
      header: 'Acting %',
      className: 'text-center',
      render: (c) => c.requiresDesignation ? `${Math.round(c.actingScoreMultiplier * 100)}%` : '—',
    },
    {
      key: 'fullTimeScoreMultiplier',
      header: 'Full-time %',
      className: 'text-center',
      render: (c) => c.requiresDesignation ? `${Math.round(c.fullTimeScoreMultiplier * 100)}%` : '—',
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Service Categories"
        description="Manage the categories used to classify service positions for teaching-staff promotion"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />

      <DataTable
        data={categories}
        columns={columns}
        searchPlaceholder="Search categories..."
        searchKeys={['name']}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyMessage="No service categories found"
        actions={(category) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" aria-label={`Edit ${category.name}`} onClick={() => handleOpenEdit(category)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} onClick={() => handleOpenDelete(category)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Service Category' : 'Add Service Category'}</DialogTitle>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description shown to admins"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="requiresDesignation"
                checked={formData.requiresDesignation}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requiresDesignation: !!checked, requiresCommitteeName: checked ? false : formData.requiresCommitteeName })
                }
              />
              <Label htmlFor="requiresDesignation" className="cursor-pointer">
                Requires Acting / Full-time designation
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="requiresCommitteeName"
                checked={formData.requiresCommitteeName}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requiresCommitteeName: !!checked, requiresDesignation: checked ? false : formData.requiresDesignation })
                }
              />
              <Label htmlFor="requiresCommitteeName" className="cursor-pointer">
                Requires committee name / title
              </Label>
            </div>

            {formData.requiresDesignation && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actingScoreMultiplier">Acting Score %</Label>
                  <Input
                    id="actingScoreMultiplier"
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={Math.round(formData.actingScoreMultiplier * 100)}
                    onChange={(e) => setFormData({ ...formData, actingScoreMultiplier: Number(e.target.value) / 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullTimeScoreMultiplier">Full-time Score %</Label>
                  <Input
                    id="fullTimeScoreMultiplier"
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={Math.round(formData.fullTimeScoreMultiplier * 100)}
                    onChange={(e) => setFormData({ ...formData, fullTimeScoreMultiplier: Number(e.target.value) / 100 })}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingCategory ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Service Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone. Categories with service positions assigned to them cannot be deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
