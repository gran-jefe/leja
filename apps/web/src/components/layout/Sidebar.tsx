'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  // The drawer previously had no Escape handler and no scroll lock — it just
  // popped in over a still-scrollable page.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  // Never leave the drawer open across a navigation.
  useEffect(() => setMobileOpen(false), [pathname]);

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

  const tenantLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/properties/browse', label: 'Browse Properties', icon: Search },
    { href: '/agreements', label: 'My Agreements', icon: FileText },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/rental-history', label: 'Rental History', icon: History },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  // PROVIDER had no branch at all, so providers were shown landlord nav
  // ("My Properties", "Agreements") that isn't theirs, with no route to the
  // job pool they actually work from.
  const providerLinks = [
    { href: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/provider/jobs', label: 'Open Jobs', icon: Briefcase },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const landlordLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/properties', label: 'My Properties', icon: Building2 },
    { href: '/agreements', label: 'Agreements', icon: FileText },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const links = inAdminSection
    ? adminLinks
    : user?.role === 'TENANT'
      ? tenantLinks
      : user?.role === 'PROVIDER'
        ? providerLinks
        : landlordLinks;

  const renderLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 px-4 space-y-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={isActive(href) ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 px-4 py-2.5 rounded-button font-body text-body-sm transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900',
            isActive(href)
              ? 'bg-brass-500 text-ink-950 font-semibold'
              : 'text-on-dark-muted hover:text-on-dark hover:bg-white/5'
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
        <div className="w-8 h-8 rounded-full bg-brass-500 flex items-center justify-center font-body font-semibold text-ink-950 text-body-sm flex-shrink-0">
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
      <div className="md:hidden sticky top-0 z-30 bg-navy-900 border-b border-white/10 flex items-center justify-between px-4 py-3 flex-shrink-0">
        <Link href={inAdminSection ? '/admin' : '/dashboard'} aria-label="BeyondAgency">
          <Logo onDark size="sm" />
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-on-dark p-2 -mr-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-navy-900 min-h-screen flex-col flex-shrink-0 border-r border-white/5">
        <div className="p-6">
          <Link href={inAdminSection ? '/admin' : '/dashboard'} aria-label="BeyondAgency">
            <Logo onDark size="sm" />
          </Link>
          {inAdminSection && (
            <p className="font-mono text-label uppercase text-brass-300 mt-2">Admin</p>
          )}
        </div>
        {renderLinks()}
        {renderUserFooter()}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="w-72 max-w-[80vw] bg-navy-900 flex flex-col h-full shadow-xl">
            <div className="p-6 flex items-center justify-between">
              <Link
                href={inAdminSection ? '/admin' : '/dashboard'}
                onClick={() => setMobileOpen(false)}
                aria-label="BeyondAgency"
              >
                <Logo onDark size="sm" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-on-dark p-2 -mr-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            {renderLinks(() => setMobileOpen(false))}
            {renderUserFooter(() => setMobileOpen(false))}
          </div>
          <div
            className="flex-1 bg-ink-950/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        </div>
      )}
    </>
  );
};
