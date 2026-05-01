import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ClipboardList,
  X,
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAdminData';
import type { AuditLogFilters } from '@/types';
import { format } from 'date-fns';

const METHOD_COLORS: Record<string, string> = {
  POST: 'bg-green-100 text-green-800',
  PUT: 'bg-blue-100 text-blue-800',
  PATCH: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
  GET: 'bg-gray-100 text-gray-700',
};

const STATUS_VARIANT = (code?: number): 'default' | 'destructive' | 'secondary' => {
  if (!code) return 'secondary';
  if (code >= 200 && code < 300) return 'default';
  if (code >= 400) return 'destructive';
  return 'secondary';
};

const ENTITY_TYPES = [
  'All',
  // Shared
  'Schools',
  'Faculties',
  'Departments',
  'Staffs',
  // Academic
  'Committees',
  'AcademicPositions',
  'ServicePositions',
  'PublicationIndicators',
  'StaffUpdates',
  'Applications',
  // Non-Academic
  'NonAcademicCommittees',
  'NonAcademicPositions',
];

const PAGE_SIZE = 20;

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data, isLoading } = useAuditLogs(filters);
  const logs = data?.results ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = filters.page ?? 1;

  const applySearch = () => {
    setFilters((f) => ({ ...f, search: search || undefined, page: 1 }));
  };

  const clearFilters = () => {
    setSearch('');
    setFilters({ page: 1, pageSize: PAGE_SIZE });
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const goToPage = (page: number) => {
    setFilters((f) => ({ ...f, page: Math.max(1, Math.min(page, totalPages)) }));
  };

  const hasActiveFilters =
    !!filters.platform ||
    !!filters.entityType ||
    !!filters.from ||
    !!filters.to ||
    !!filters.search;

  return (
    <AdminLayout>
      <PageHeader
        title="Audit Logs"
        description="Track all system activities across portals"
      />

      {/* Filter Bar */}
      <div className="mb-6 rounded-lg border bg-card p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Search actor / path</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                className="h-9 text-sm"
              />
              <Button size="sm" variant="secondary" onClick={applySearch} className="shrink-0">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Platform</Label>
            <Select
              value={filters.platform ?? 'all'}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, platform: v === 'all' ? undefined : v, page: 1 }))
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="non-academic">Non-Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entity Type */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Entity Type</Label>
            <Select
              value={filters.entityType ?? 'All'}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, entityType: v === 'All' ? undefined : v, page: 1 }))
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((et) => (
                  <SelectItem key={et} value={et}>
                    {et}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Date range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                className="h-9 text-sm"
                value={filters.from ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, from: e.target.value || undefined, page: 1 }))
                }
              />
              <Input
                type="date"
                className="h-9 text-sm"
                value={filters.to ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, to: e.target.value || undefined, page: 1 }))
                }
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Active filters</span>
            <Button size="sm" variant="ghost" onClick={clearFilters} className="h-7 gap-1 text-xs">
              <X className="h-3 w-3" /> Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <ClipboardList className="mr-2 h-5 w-5 animate-pulse" />
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <ClipboardList className="h-8 w-8 opacity-40" />
            <p className="text-sm">No audit logs found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const isOpen = expandedRows.has(log.id);
                return (
                  <>
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(log.id)}
                    >
                      <TableCell className="py-2 pr-0">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="font-medium text-sm leading-tight">
                          {log.performedByName ?? log.performedByUserId ?? '—'}
                        </div>
                        {log.performedByEmail && (
                          <div className="text-xs text-muted-foreground">{log.performedByEmail}</div>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          {log.httpMethod && (
                            <span
                              className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${METHOD_COLORS[log.httpMethod] ?? 'bg-gray-100 text-gray-700'}`}
                            >
                              {log.httpMethod}
                            </span>
                          )}
                          <span className="text-sm truncate max-w-[160px]" title={log.action}>
                            {log.action}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-sm">
                        {log.entityType ?? '—'}
                        {log.entityId && (
                          <span className="ml-1 text-xs text-muted-foreground">#{log.entityId.slice(0, 8)}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="capitalize text-xs">
                          {log.platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant={STATUS_VARIANT(log.statusCode)} className="text-xs">
                          {log.statusCode ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">
                        {log.ipAddress ?? '—'}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.createdAt), 'dd MMM yy, HH:mm')}
                      </TableCell>
                    </TableRow>

                    {isOpen && (
                      <TableRow key={`${log.id}-detail`} className="bg-muted/30">
                        <TableCell />
                        <TableCell colSpan={7} className="py-3">
                          <div className="grid grid-cols-1 gap-y-1 gap-x-6 text-xs sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <span className="font-medium text-muted-foreground">Role: </span>
                              {log.performedByRole ?? '—'}
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Entity ID: </span>
                              <span className="font-mono">{log.entityId ?? '—'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Request path: </span>
                              <span className="font-mono">{log.requestPath ?? '—'}</span>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                              <span className="font-medium text-muted-foreground">User agent: </span>
                              <span className="break-all">{log.userAgent ?? '—'}</span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {totalCount} record{totalCount !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => goToPage(1)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(totalPages)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
