'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Users, Search, Building2 } from 'lucide-react';
import { useAdminCustomers } from '@/hooks/use-admin-customers';
import { CustomerEditDialog } from './customer-edit-dialog';

interface Customer {
  id: string | number;
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

export function CustomersTable() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const { data, isLoading } = useAdminCustomers(
    statusFilter !== 'all' ? statusFilter : undefined,
    search || undefined
  );

  const customers: Customer[] = useMemo(() => data?.customers ?? [], [data]);

  return (
    <>
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
                        onClick={() => setSelectedCustomer(customer)}
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
      {selectedCustomer && (
        <CustomerEditDialog
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </>
  );
}
