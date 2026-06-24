'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const navigation = [
  {
    name: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Verification Requests',
    href: '/admin/requests',
    icon: FileText,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast.error('Failed to logout');
    }
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-muted/40">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <ShieldCheck className="size-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">
            iVALT Admin
          </span>
          <span className="text-xs text-muted-foreground leading-tight">
            OnDemand ID
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        <div className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Management
        </div>
        {navigation.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Admin info + Logout */}
      <div className="border-t p-4">
        <div className="mb-3 rounded-md bg-muted/60 px-3 py-2">
          <p className="text-xs font-medium text-foreground">Admin User</p>
          <p className="text-xs text-muted-foreground">+91 9530654704</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
