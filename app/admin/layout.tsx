import type { Metadata } from 'next';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';

export const metadata: Metadata = {
  title: 'Admin Dashboard - iVALT OnDemand ID',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
