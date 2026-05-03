import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
} from '@/hooks/useAdminData';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminUser, AdminUserFormData } from '@/types';
import { ADMIN_ROLES } from '@/types';

const ROLE_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  SuperAdmin: 'default',
  Admin: 'secondary',
  Moderator: 'outline',
};

const emptyForm = (): AdminUserFormData => ({
  firstName: '',
  lastName: '',
  email: '',
  role: 'Admin',
});

export default function AdminsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';

  const { data: admins = [], isLoading } = useAdminUsers();
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<AdminUserFormData>(emptyForm());

  const handleOpenCreate = () => {
    setEditingAdmin(null);
    setFormData(emptyForm());
    setIsFormOpen(true);
  };

  const handleOpenEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
    });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (admin: AdminUser) => {
    setDeletingAdmin(admin);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAdmin) {
      await updateMutation.mutateAsync({ id: editingAdmin.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingAdmin) return;
    await deleteMutation.mutateAsync(deletingAdmin.id);
    setIsDeleteOpen(false);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'firstName',
      header: 'Name',
      className: 'font-medium',
      render: (a) => `${a.firstName} ${a.lastName}`,
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (a) => (
        <Badge variant={ROLE_BADGE_VARIANT[a.role] ?? 'outline'}>{a.role}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (a) => new Date(a.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Administrators"
        description="Manage admin accounts"
        actions={
          isSuperAdmin ? (
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          ) : undefined
        }
      />

      <DataTable
        data={admins}
        columns={columns}
        searchPlaceholder="Search admins..."
        searchKeys={['firstName', 'lastName', 'email', 'role']}
        isLoading={isLoading}
        emptyMessage="No admins found"
        actions={
          isSuperAdmin
            ? (admin) => (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(admin)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {admin.id !== user?.id && (
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(admin)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            : undefined
        }
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAdmin ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            {!editingAdmin && (
              <p className="text-sm text-muted-foreground">
                A temporary password will be auto-generated and sent to this email address.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingAdmin ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Admin"
        description={`Are you sure you want to delete "${deletingAdmin?.firstName} ${deletingAdmin?.lastName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isDestructive
      />
    </AdminLayout>
  );
}
