'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Building2,
  History,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ShieldCheck,
  Users,
  ScrollText,
  Wallet,
  ArrowLeftRight,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  // Sidebar reflects wherever the user actually is, not just their account
  // role — an /admin/* page always gets the admin nav, even for a
  // TENANT/LANDLORD account that also happens to be on the admin
  // allowlist, so the sidebar never contradicts what's on screen.
  const inAdminSection = pathname?.startsWith('/admin');

  const adminLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/providers', label: 'Providers', icon: ShieldCheck },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/agreements', label: 'Agreements', icon: ScrollText },
    { href: '/admin/payments', label: 'Payments', icon: Wallet },
  ];

  const links = inAdminSection
    ? adminLinks
    : user?.role === 'TENANT'
      ? [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/properties/browse', label: 'Browse Properties', icon: Search },
          { href: '/agreements', label: 'My Agreements', icon: FileText },
          { href: '/messages', label: 'Messages', icon: MessageCircle },
          { href: '/rental-history', label: 'Rental History', icon: History },
          { href: '/profile', label: 'Profile', icon: User },
        ]
      : [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/properties', label: 'My Properties', icon: Building2 },
          { href: '/agreements', label: 'Agreements', icon: FileText },
          { href: '/messages', label: 'Messages', icon: MessageCircle },
          { href: '/profile', label: 'Profile', icon: User },
        ];

  const renderLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 px-4 space-y-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
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
  );

  const renderUserFooter = (onNavigate?: () => void) => (
    <div className="p-4 border-t border-white border-opacity-10">
      <div className="flex items-center gap-3 px-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center font-body font-semibold text-white text-sm flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <p className="font-body text-sm text-white truncate">{user?.name}</p>
          <p className="font-body text-xs text-white text-opacity-50 capitalize">
            {inAdminSection ? 'Admin' : user?.role?.toLowerCase()}
          </p>
        </div>
      </div>
      {isAdmin && (
        <Link
          href={inAdminSection ? '/dashboard' : '/admin'}
          onClick={onNavigate}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-button font-body text-sm text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-5 transition-colors"
        >
          <ArrowLeftRight size={18} />
          {inAdminSection ? 'Back to my dashboard' : 'Go to admin'}
        </Link>
      )}
      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-4 py-2 rounded-button font-body text-sm text-white text-opacity-70 hover:text-opacity-100 hover:bg-white hover:bg-opacity-5 transition-colors"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 bg-navy flex items-center justify-between px-4 py-3 flex-shrink-0">
        <Link href={inAdminSection ? '/admin' : '/dashboard'} className="font-display text-xl font-bold text-white">
          BeyondAgency
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-1"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-navy min-h-screen flex-col flex-shrink-0">
        <div className="p-6">
          <Link href={inAdminSection ? '/admin' : '/dashboard'} className="font-display text-2xl font-bold text-white">
            BeyondAgency
          </Link>
          {inAdminSection && (
            <p className="font-body text-xs uppercase tracking-wider text-forest font-semibold mt-1">
              Admin
            </p>
          )}
        </div>
        {renderLinks()}
        {renderUserFooter()}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[80vw] bg-navy flex flex-col h-full">
            <div className="p-6 flex items-center justify-between">
              <Link
                href={inAdminSection ? '/admin' : '/dashboard'}
                className="font-display text-2xl font-bold text-white"
                onClick={() => setMobileOpen(false)}
              >
                BeyondAgency
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white p-1"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            {renderLinks(() => setMobileOpen(false))}
            {renderUserFooter(() => setMobileOpen(false))}
          </div>
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
};
