import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Megaphone,
  FileText,
} from 'lucide-react';
import {
  useStaffUpdates,
  useCreateStaffUpdate,
  useUpdateStaffUpdate,
  useDeleteStaffUpdate,
} from '@/hooks/useAdminData';
import type { StaffUpdate, StaffUpdateFormData } from '@/types';
import { format } from 'date-fns';
import { toggleStaffUpdateVisibility } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  'Upcoming Deadline',
  'New Policy',
  'System Update',
  'General Notice',
  'Regulation Change',
];

const PRIORITIES: { value: string; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const emptyForm: StaffUpdateFormData = {
  title: '',
  content: '',
  category: 'General Notice',
  priority: 'low',
  isVisible: true,
};

export default function StaffUpdatesPage() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data: pagedData, isLoading } = useStaffUpdates(currentPage, pageSize, search || undefined);
  const createMutation = useCreateStaffUpdate();
  const updateMutation = useUpdateStaffUpdate();
  const deleteMutation = useDeleteStaffUpdate();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<StaffUpdate | null>(null);
  const [formData, setFormData] = useState<StaffUpdateFormData>({ ...emptyForm });
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUpdate, setDeletingUpdate] = useState<StaffUpdate | null>(null);

  const handleOpenCreate = () => {
    setEditingUpdate(null);
    setFormData({ ...emptyForm });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (update: StaffUpdate) => {
    setEditingUpdate(update);
    setFormData({
      title: update.title,
      content: update.content,
      category: update.category,
      priority: update.priority,
      isVisible: update.isVisible,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: 'Validation', description: 'Title is required', variant: 'destructive' });
      return;
    }
    if (!formData.content.trim() || formData.content === '<p></p>') {
      toast({ title: 'Validation', description: 'Content is required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingUpdate) {
        await updateMutation.mutateAsync({ id: editingUpdate.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsFormOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (update: StaffUpdate) => {
    try {
      await toggleStaffUpdateVisibility(update.id);
      toast({
        title: 'Success',
        description: update.isVisible ? 'Update hidden from portal' : 'Update visible on portal',
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle visibility', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletingUpdate) return;
    await deleteMutation.mutateAsync(deletingUpdate.id);
    setIsDeleteOpen(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const totalPages = pagedData?.totalPages || 1;
  const updates = pagedData?.results ?? [];

  const priorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${variants[priority] || variants.low}`}>
        {priority}
      </span>
    );
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Staff Updates"
        description="Manage announcements and updates visible on the academic portal"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Update
          </Button>
        }
      />

      <div className="data-table-container">
        {/* Search and filters */}
        <div className="flex items-center justify-between gap-4 border-b p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search updates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={String(pageSize)}
              onValueChange={value => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-table-header hover:bg-table-header">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Priority</TableHead>
                <TableHead className="font-semibold text-center">Visible</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="w-[140px] text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : updates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                        <Megaphone className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">No updates yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mb-4">
                        Staff updates will appear here once created. These are shown to staff on the academic portal.
                      </p>
                      <Button size="sm" onClick={handleOpenCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Update
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                updates.map(update => (
                  <TableRow key={update.id} className="hover:bg-table-row-hover transition-colors">
                    <TableCell className="font-medium max-w-[300px]">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{update.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {update.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{priorityBadge(update.priority)}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggleVisibility(update)}
                        className="inline-flex items-center justify-center"
                        title={update.isVisible ? 'Click to hide' : 'Click to show'}
                      >
                        {update.isVisible ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(update.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(update)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingUpdate(update);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {updates.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              {pagedData.totalCount} total result{pagedData.totalCount !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUpdate ? 'Edit Update' : 'New Staff Update'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Q3 Promotion Cycle Submissions"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={value => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                content={formData.content}
                onChange={html => setFormData(prev => ({ ...prev, content: html }))}
                placeholder="Write the update content here..."
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="visible">Visible on portal</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, this update is shown to staff on the academic portal
                </p>
              </div>
              <Switch
                id="visible"
                checked={formData.isVisible}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, isVisible: checked }))}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingUpdate ? 'Save Changes' : 'Create Update'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Staff Update"
        description={`Are you sure you want to delete "${deletingUpdate?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        isDestructive
        confirmLabel="Delete"
      />
    </AdminLayout>
  );
}
