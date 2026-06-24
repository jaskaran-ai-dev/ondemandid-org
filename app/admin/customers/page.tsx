'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Users, Search, Mail, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  countryCode: string;
  mobile: string;
  initialUsers: number;
  idConnection: string | null;
  status: string;
  notes: string | null;
  createdAt: number;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default' as const;
    case 'pending':
      return 'secondary' as const;
    case 'inactive':
      return 'outline' as const;
    default:
      return 'secondary' as const;
  }
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editIdConnection, setEditIdConnection] = useState('');

  const { data, isLoading } = useQuery<{ customers: Customer[] }>({
    queryKey: ['admin-customers', statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/customers?${params}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      status?: string;
      idConnection?: string;
    }) => {
      const res = await fetch(`/api/admin/customers/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update customer');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Customer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedCustomer(null);
    },
    onError: () => {
      toast.error('Failed to update customer');
    },
  });

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditStatus(customer.status);
    setEditIdConnection(customer.idConnection || '');
  };

  const handleSave = () => {
    if (!selectedCustomer) return;
    updateMutation.mutate({
      id: selectedCustomer.id,
      status: editStatus,
      idConnection: editIdConnection,
    });
  };

  const customers = data?.customers ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Customers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage enterprise customers and their IDCONNECTION provisioning.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, contact, email, or IDCONNECTION..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="size-6" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>IDCONNECTION</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        <span className="font-medium">
                          {customer.companyName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{customer.contactName}</span>
                        <span className="text-xs text-muted-foreground">
                          {customer.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.idConnection ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {customer.idConnection}
                        </code>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Not provisioned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{customer.initialUsers}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(customer)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog
        open={!!selectedCustomer}
        onOpenChange={open => !open && setSelectedCustomer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Customer</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.companyName} - {selectedCustomer?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4 py-2">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm font-medium">
                    {selectedCustomer.contactName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mobile</p>
                  <p className="text-sm font-medium">
                    {selectedCustomer.countryCode} {selectedCustomer.mobile}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Initial Users</p>
                  <p className="text-sm font-medium">
                    {selectedCustomer.initialUsers}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
                {selectedCustomer.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>

              {/* Edit fields */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    IDCONNECTION Code
                  </label>
                  <Input
                    value={editIdConnection}
                    onChange={e =>
                      setEditIdConnection(e.target.value.toUpperCase())
                    }
                    placeholder="e.g., ACME01"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provision this code to activate the customer for
                    verifications.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedCustomer(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Spinner className="size-4" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
