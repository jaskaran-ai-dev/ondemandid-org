import { CustomersTable } from '@/components/admin/customers-table';
import { CustomerCreateDialog } from '@/components/admin/customer-create-dialog';
import { CustomerStats } from '@/components/admin/customer-stats';

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage enterprise customers and their IDCONNECTION provisioning.
          </p>
        </div>
        <CustomerCreateDialog />
      </div>
      <CustomerStats />
      <CustomersTable />
    </div>
  );
}
