'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { useAdminUpdateCustomer } from '@/hooks/use-admin-customers';

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

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CustomerEditDialog({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const updateMutation = useAdminUpdateCustomer();
  const [editStatus, setEditStatus] = useState(customer.status);
  const [editIdConnection, setEditIdConnection] = useState(
    customer.idConnection || ''
  );

  const handleSave = () => {
    updateMutation.mutate(
      {
        id: String(customer.id),
        status: editStatus as 'pending' | 'active' | 'inactive',
        idConnection: editIdConnection,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Customer</DialogTitle>
          <DialogDescription>
            {customer.companyName} - {customer.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
            <div>
              <p className="text-xs text-muted-foreground">Contact</p>
              <p className="text-sm font-medium">{customer.contactName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mobile</p>
              <p className="text-sm font-medium">
                {customer.countryCode} {customer.mobile}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Initial Users</p>
              <p className="text-sm font-medium">{customer.initialUsers}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {formatDate(customer.createdAt)}
              </p>
            </div>
            {customer.notes && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm">{customer.notes}</p>
              </div>
            )}
          </div>

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
              <label className="text-sm font-medium">IDCONNECTION Code</label>
              <Input
                value={editIdConnection}
                onChange={e =>
                  setEditIdConnection(e.target.value.toUpperCase())
                }
                placeholder="e.g., ACME01"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Provision this code to activate the customer for verifications.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
  );
}
