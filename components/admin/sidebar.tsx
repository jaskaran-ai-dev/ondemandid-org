'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  ShieldCheck,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
];

const STORAGE_KEY = 'ivalt-admin-sidebar-collapsed';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setCollapsed(stored === 'true');
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  };

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

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));

  const SidebarContent = ({
    isCollapsed = false,
    showCollapse = false,
  }: {
    isCollapsed?: boolean;
    showCollapse?: boolean;
  }) => (
    <>
      {/* Logo / Brand */}
      <div
        className={cn(
          'flex h-16 items-center gap-2 border-b',
          isCollapsed ? 'justify-center px-0' : 'justify-between pl-6 pr-2'
        )}
      >
        <div className={cn('flex items-center gap-2', isCollapsed && 'justify-center')}>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">
                iVALT Admin
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                OnDemand ID
              </span>
            </div>
          )}
        </div>
        {showCollapse && !isCollapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            className="text-muted-foreground"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          'flex-1 space-y-1 py-6',
          isCollapsed ? 'flex flex-col items-center px-0' : 'px-4'
        )}
      >
        <div
          className={cn(
            'mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground',
            isCollapsed && 'sr-only'
          )}
        >
          Management
        </div>
        {navigation.map(item => {
          const active = isActive(item.href);
          const link = (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isCollapsed
                  ? 'min-w-10 justify-center px-0'
                  : undefined,
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'shrink-0',
                  isCollapsed ? 'min-w-4 size-5' : 'size-4'
                )}
              />
              {!isCollapsed && item.name}
            </Link>
          );

          return isCollapsed ? (
            <Tooltip key={item.name} delayDuration={0}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.name}</TooltipContent>
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      {/* Admin info + Logout + Collapse toggle */}
      <div className="border-t p-4">
        {!isCollapsed && (
          <div className="mb-3 rounded-md bg-muted/60 px-3 py-2">
            <p className="text-xs font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">+91 9530654704</p>
          </div>
        )}
        <div className={cn('space-y-1', isCollapsed && 'flex flex-col items-center')}>
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="size-4 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4 shrink-0" />
              Logout
            </button>
          )}
          {showCollapse && isCollapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  aria-label="Expand sidebar"
                  className="flex w-full items-center justify-center rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <PanelLeftOpen className="size-4 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-16 items-center gap-2 border-b bg-background px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex relative sticky top-0 h-screen flex-col border-r bg-muted/40 transition-[width] duration-300 ease-in-out',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <SidebarContent isCollapsed={collapsed} showCollapse />
        {collapsed && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                className="absolute -right-3 top-5 z-10 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
              >
                <PanelLeftOpen className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        )}
      </aside>
    </>
  );
}