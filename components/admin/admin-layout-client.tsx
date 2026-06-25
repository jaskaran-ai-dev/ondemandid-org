'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminGuard } from '@/components/admin/admin-guard';

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 pt-20 md:pt-0 p-6 md:p-8 lg:p-10">{children}</main>
      </div>
    </AdminGuard>
  );
}
