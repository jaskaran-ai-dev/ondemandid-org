'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminGuard } from '@/components/admin/admin-guard';
import { Spinner } from '@/components/ui/spinner';

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
        <main className="flex-1 p-6 md:p-8 lg:p-10">{children}</main>
      </div>
    </AdminGuard>
  );
}
