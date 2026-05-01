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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useNonAcademicPositions,
  useCreateNonAcademicPosition,
  useUpdateNonAcademicPosition,
  useDeleteNonAcademicPosition,
} from '@/hooks/useAdminData';
import type { NonAcademicPosition, NonAcademicPositionFormData } from '@/types';

const UNIT_TYPES = ['Registry', 'Finance', 'Library', 'Works', 'Estate', 'ICT'];

const emptyForm: NonAcademicPositionFormData = {
  name: '',
  performanceCriteria: [],
  minimumNumberOfYearsFromLastPromotion: 0,
  previousPosition: '',
  minimumNumberOfKnowledgeMaterials: 0,
  minimumNumberOfJournals: 0,
  unitType: '',
};

export default function NonAcademicPositionsPage() {
  const { data: positions = [], isLoading } = useNonAcademicPositions();
  const createMutation = useCreateNonAcademicPosition();
  const updateMutation = useUpdateNonAcademicPosition();
  const deleteMutation = useDeleteNonAcademicPosition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<NonAcademicPosition | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<NonAcademicPosition | null>(null);
  const [formData, setFormData] = useState<NonAcademicPositionFormData>({ ...emptyForm });
  const [criteriaText, setCriteriaText] = useState('');

  const handleOpenCreate = () => {
    setEditingPosition(null);
    setFormData({ ...emptyForm });
    setCriteriaText('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (position: NonAcademicPosition) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      performanceCriteria: position.performanceCriteria || [],
      minimumNumberOfYearsFromLastPromotion: position.minimumNumberOfYearsFromLastPromotion,
      previousPosition: position.previousPosition || '',
      minimumNumberOfKnowledgeMaterials: position.minimumNumberOfKnowledgeMaterials,
      minimumNumberOfJournals: position.minimumNumberOfJournals,
      unitType: position.unitType || '',
    });
    setCriteriaText((position.performanceCriteria || []).join('\n'));
    setIsFormOpen(true);
  };

  const handleOpenDelete = (position: NonAcademicPosition) => {
    setDeletingPosition(position);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const criteria = criteriaText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const payload: NonAcademicPositionFormData = {
      ...formData,
      performanceCriteria: criteria,
      unitType: formData.unitType || undefined,
      previousPosition: formData.previousPosition || undefined,
    };

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

  const columns: Column<NonAcademicPosition>[] = [
    { key: 'name', header: 'Position', className: 'font-medium' },
    { key: 'previousPosition', header: 'Previous Position' },
    {
      key: 'minimumNumberOfYearsFromLastPromotion',
      header: 'Min Years',
      className: 'text-center',
      render: (p) => p.minimumNumberOfYearsFromLastPromotion,
    },
    {
      key: 'minimumNumberOfKnowledgeMaterials',
      header: 'Min Knowledge Materials',
      className: 'text-center',
      render: (p) => p.minimumNumberOfKnowledgeMaterials,
    },
    {
      key: 'minimumNumberOfJournals',
      header: 'Min Journals',
      className: 'text-center',
      render: (p) => p.minimumNumberOfJournals,
    },
    {
      key: 'unitType',
      header: 'Unit Type',
      render: (p) => p.unitType || <span className="text-muted-foreground text-sm">Any</span>,
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Non-Academic Positions"
        description="Manage non-academic staff promotion tracks and eligibility criteria"
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
        searchKeys={['name', 'previousPosition', 'unitType']}
        isLoading={isLoading}
        emptyMessage="No positions found"
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
              {editingPosition ? 'Edit Non-Academic Position' : 'Add Non-Academic Position'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Position Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Senior Administrative Assistant"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousPosition">Previous Position (optional)</Label>
              <Input
                id="previousPosition"
                value={formData.previousPosition || ''}
                onChange={(e) => setFormData({ ...formData, previousPosition: e.target.value })}
                placeholder="e.g., Administrative Assistant"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minKnowledge">Min Materials</Label>
                <Input
                  id="minKnowledge"
                  type="number"
                  min="0"
                  value={formData.minimumNumberOfKnowledgeMaterials}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumNumberOfKnowledgeMaterials: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minJournals">Min Journals</Label>
                <Input
                  id="minJournals"
                  type="number"
                  min="0"
                  value={formData.minimumNumberOfJournals}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumNumberOfJournals: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitType">Unit Type (optional — leave blank for all units)</Label>
              <Select
                value={formData.unitType || '_none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, unitType: value === '_none' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Any unit</SelectItem>
                  {UNIT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="criteria">
                Performance Criteria
                <span className="ml-1 text-xs text-muted-foreground">(one per line)</span>
              </Label>
              <Textarea
                id="criteria"
                rows={4}
                value={criteriaText}
                onChange={(e) => setCriteriaText(e.target.value)}
                placeholder={`e.g.\nHigh,High,Adequate\nGood,Good,Good`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
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
        title="Delete Non-Academic Position"
        description={`Are you sure you want to delete "${deletingPosition?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
