'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAdminRequests } from '@/hooks/use-admin-requests';
import { Pagination } from './pagination';

interface VerificationRequest {
  id: string | number;
  idConnection: string;
  countryCode: string;
  mobile: string;
  status: string;
  ivaltStatusCode: number | null;
  requestFrom: string | null;
  createdAt: number;
  completedAt: number | null;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'authenticated':
      return 'default' as const;
    case 'failed':
      return 'destructive' as const;
    case 'pending':
    case 'initiated':
      return 'secondary' as const;
    case 'not_found':
      return 'outline' as const;
    case 'error':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
};

function formatDateTime(ts: number | null) {
  if (!ts) return '-';
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(start: number, end: number | null) {
  if (!end) return '-';
  const seconds = Math.floor((end - start) / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

const DEFAULT_PAGE_SIZE = 10;

export function AdminRequests() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading } = useAdminRequests(
    statusFilter !== 'all' ? statusFilter : undefined,
    page,
    pageSize
  );

  const requests: VerificationRequest[] = useMemo(
    () => (data as { requests?: VerificationRequest[] })?.requests ?? [],
    [data]
  );
  const total: number = useMemo(
    () => (data as { total?: number })?.total ?? 0,
    [data]
  );
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const summary = {
    authenticated: requests.filter(r => r.status === 'authenticated').length,
    failed: requests.filter(r => r.status === 'failed').length,
    pending: requests.filter(
      r => r.status === 'pending' || r.status === 'initiated'
    ).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Verification Requests
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor all biometric verification requests across customers.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.authenticated}</p>
              <p className="text-xs text-muted-foreground">Authenticated</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={v => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending / Initiated</SelectItem>
            <SelectItem value="authenticated">Authenticated</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="not_found">Not Found</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="size-6" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No requests found</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IDCONNECTION</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>iVALT Code</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(req => (
                  <TableRow key={String(req.id)}>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {req.idConnection}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">
                      {req.countryCode} {req.mobile}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(req.status)}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {req.ivaltStatusCode ?? '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {req.requestFrom ?? '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(req.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(req.completedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDuration(req.createdAt, req.completedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && requests.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={size => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
