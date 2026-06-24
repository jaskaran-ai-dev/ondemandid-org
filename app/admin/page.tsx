'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Users,
  UserCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface StatsData {
  totalCustomers: number;
  activeCustomers: number;
  pendingCustomers: number;
  inactiveCustomers: number;
  totalRequests: number;
  authenticatedRequests: number;
  failedRequests: number;
  pendingRequests: number;
  recentRequests: Array<{
    id: string;
    idConnection: string;
    mobile: string;
    status: string;
    createdAt: number;
  }>;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={`flex size-12 items-center justify-center rounded-xl ${accent || 'bg-primary/10'}`}>
          <Icon className="size-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
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
    default:
      return 'secondary' as const;
  }
};

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery<StatsData>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  const successRate =
    data.totalRequests > 0
      ? Math.round((data.authenticatedRequests / data.totalRequests) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor customers and verification activity at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={data.totalCustomers}
          icon={Users}
          description={`${data.activeCustomers} active`}
          accent="bg-primary/10"
        />
        <StatCard
          title="Active Customers"
          value={data.activeCustomers}
          icon={UserCheck}
          description={`${data.pendingCustomers} pending provisioning`}
          accent="bg-primary/10"
        />
        <StatCard
          title="Total Requests"
          value={data.totalRequests}
          icon={FileText}
          description="All verification requests"
          accent="bg-primary/10"
        />
        <StatCard
          title="Success Rate"
          value={successRate}
          icon={TrendingUp}
          description={`${data.authenticatedRequests} authenticated`}
          accent="bg-primary/10"
        />
      </div>

      {/* Verification breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data.authenticatedRequests}
              </p>
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
              <p className="text-2xl font-bold">{data.failedRequests}</p>
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
              <p className="text-2xl font-bold">{data.pendingRequests}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Verification Requests</CardTitle>
          <CardDescription>
            Latest activity across all customer connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No verification requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentRequests.map(req => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {req.idConnection}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.mobile} - {formatTime(req.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant(req.status)}>
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
