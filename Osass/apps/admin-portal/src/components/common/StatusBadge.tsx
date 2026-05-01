import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'under-review' | 'approved' | 'rejected' | 'on-leave';
  className?: string;
}

const statusConfig = {
  active: { label: 'Active', className: 'active' },
  inactive: { label: 'Inactive', className: 'inactive' },
  pending: { label: 'Pending', className: 'pending' },
  'under-review': { label: 'Under Review', className: 'pending' },
  approved: { label: 'Approved', className: 'active' },
  rejected: { label: 'Rejected', className: 'rejected' },
  'on-leave': { label: 'On Leave', className: 'pending' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
