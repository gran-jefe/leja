'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Building2, History, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => pathname === href;

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agreements', label: 'Agreements', icon: FileText },
    ...(user?.role === 'LANDLORD'
      ? [{ href: '/properties', label: 'Properties', icon: Building2 }]
      : []),
    ...(user?.role === 'TENANT'
      ? [{ href: '/rental-history', label: 'Rental History', icon: History }]
      : []),
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-navy min-h-screen flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="font-display text-2xl font-bold text-white">
          Leja
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-button font-body text-sm transition-colors',
              isActive(href)
                ? 'bg-forest text-white font-semibold'
                : 'text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-5'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white border-opacity-10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center font-body font-semibold text-white text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="font-body text-sm text-white truncate">{user?.name}</p>
            <p className="font-body text-xs text-white text-opacity-50 capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-button font-body text-sm text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-5 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};
