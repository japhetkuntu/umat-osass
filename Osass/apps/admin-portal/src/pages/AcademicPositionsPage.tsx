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
import { Textarea } from '@/components/ui/textarea';
import {
  useAcademicPositions,
  useCreateAcademicPosition,
  useUpdateAcademicPosition,
  useDeleteAcademicPosition,
} from '@/hooks/useAdminData';
import type { AcademicPosition, AcademicPositionFormData } from '@/types';

const emptyForm: AcademicPositionFormData = {
  name: '',
  performanceCriteria: [],
  minimumNumberOfYearsFromLastPromotion: 0,
  previousPosition: '',
  minimumNumberOfPublications: 0,
  minimumNumberOfRefereedJournal: 0,
};

export default function AcademicPositionsPage() {
  const { data: positions = [], isLoading } = useAcademicPositions();
  const createMutation = useCreateAcademicPosition();
  const updateMutation = useUpdateAcademicPosition();
  const deleteMutation = useDeleteAcademicPosition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<AcademicPosition | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<AcademicPosition | null>(null);
  const [formData, setFormData] = useState<AcademicPositionFormData>({ ...emptyForm });
  const [criteriaText, setCriteriaText] = useState('');

  const handleOpenCreate = () => {
    setEditingPosition(null);
    setFormData({ ...emptyForm });
    setCriteriaText('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (position: AcademicPosition) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      performanceCriteria: position.performanceCriteria || [],
      minimumNumberOfYearsFromLastPromotion: position.minimumNumberOfYearsFromLastPromotion,
      previousPosition: position.previousPosition || '',
      minimumNumberOfPublications: position.minimumNumberOfPublications,
      minimumNumberOfRefereedJournal: position.minimumNumberOfRefereedJournal,
    });
    setCriteriaText((position.performanceCriteria || []).join('\n'));
    setIsFormOpen(true);
  };

  const handleOpenDelete = (position: AcademicPosition) => {
    setDeletingPosition(position);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const criteria = criteriaText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const payload = { ...formData, performanceCriteria: criteria };

    if (editingPosition) {
      await updateMutation.mutateAsync({ id: editingPosition.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingPosition) return;
    await deleteMutation.mutateAsync(deletingPosition.id);
    setIsDeleteOpen(false);
  };

  const columns: Column<AcademicPosition>[] = [
    { key: 'name', header: 'Position', className: 'font-medium' },
    { key: 'previousPosition', header: 'Previous Position' },
    {
      key: 'minimumNumberOfYearsFromLastPromotion',
      header: 'Min Years',
      className: 'text-center',
    },
    {
      key: 'minimumNumberOfPublications',
      header: 'Min Publications',
      className: 'text-center',
    },
    {
      key: 'minimumNumberOfRefereedJournal',
      header: 'Min Refereed Journals',
      className: 'text-center',
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Academic Positions"
        description="Manage academic promotion positions and requirements"
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
        searchKeys={['name', 'previousPosition']}
        isLoading={isLoading}
        emptyMessage="No academic positions found"
        actions={(position) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(position)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(position)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? 'Edit Academic Position' : 'Add Academic Position'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Position Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Associate Professor"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousPosition">Previous Position</Label>
                <Input
                  id="previousPosition"
                  value={formData.previousPosition}
                  onChange={(e) =>
                    setFormData({ ...formData, previousPosition: e.target.value })
                  }
                  placeholder="e.g., Senior Lecturer"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minYears">Min Years</Label>
                <Input
                  id="minYears"
                  type="number"
                  min="0"
                  value={formData.minimumNumberOfYearsFromLastPromotion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumNumberOfYearsFromLastPromotion: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minPub">Min Publications</Label>
                <Input
                  id="minPub"
                  type="number"
                  min="0"
                  value={formData.minimumNumberOfPublications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumNumberOfPublications: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minRefereed">Min Refereed</Label>
                <Input
                  id="minRefereed"
                  type="number"
                  min="0"
                  value={formData.minimumNumberOfRefereedJournal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumNumberOfRefereedJournal: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="criteria">Performance Criteria (one per line)</Label>
              <Textarea
                id="criteria"
                value={criteriaText}
                onChange={(e) => setCriteriaText(e.target.value)}
                rows={4}
                placeholder="e.g., High,High,Adequate&#10;Good,Good,Good"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingPosition ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Academic Position"
        description={`Are you sure you want to delete "${deletingPosition?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
