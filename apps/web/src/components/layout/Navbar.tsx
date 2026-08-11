'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/brand/Logo';
import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/utils';

const marketingLinks = [
  { href: '/#platform', label: 'Platform' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/provider/apply', label: 'For providers' },
];

const landlordLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/properties', label: 'My Properties' },
  { href: '/agreements', label: 'Agreements' },
  { href: '/profile', label: 'Profile' },
];

const tenantLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/properties/browse', label: 'Browse Properties' },
  { href: '/agreements', label: 'My Agreements' },
  { href: '/rental-history', label: 'Rental History' },
  { href: '/profile', label: 'Profile' },
];

const providerLinks = [
  { href: '/provider/dashboard', label: 'Dashboard' },
  { href: '/provider/jobs', label: 'Open Jobs' },
  { href: '/profile', label: 'Profile' },
];

/**
 * One component, two behaviours, selected by route rather than by duplicated
 * markup — the previous version had two entirely separate returns, so the
 * mobile drawer existed only on `/` and authenticated pages showed a nav with
 * no links at all on small screens (`hidden md:flex` with no mobile fallback).
 */
export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const isLanding = pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const roleLinks =
    user?.role === 'LANDLORD'
      ? landlordLinks
      : user?.role === 'TENANT'
        ? tenantLinks
        : user?.role === 'PROVIDER'
          ? providerLinks
          : [];

  const links = isAuthenticated ? roleLinks : marketingLinks;

  // Transparent over the hero, solid once past it. Only meaningful on `/`.
  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLanding]);

  // Close on route change so the drawer never survives a navigation.
  useEffect(() => setMobileOpen(false), [pathname]);

  // Escape to close + scroll lock. The old drawer had neither.
  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const floating = isLanding && !scrolled;

  return (
    <header
      className={cn(
        'top-0 left-0 w-full z-50 transition-colors duration-slow ease-standard',
        isLanding ? 'fixed' : 'sticky',
        floating ? 'bg-transparent' : 'bg-navy-900/95 backdrop-blur-md border-b border-white/10'
      )}
    >
      <Container>
        <div className="flex items-center justify-between h-16 sm:h-18 py-3">
          <Link href="/" className="rounded-sm" aria-label="BeyondAgency home">
            <Logo onDark size="sm" />
          </Link>

          <nav className="hidden md:flex gap-8 items-center" aria-label="Main">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-body-sm text-on-dark-muted hover:text-on-dark transition-colors duration-fast"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <span className="font-body text-body-sm text-on-dark-muted hidden lg:inline">
                  {user?.name}
                </span>
                <Button variant="secondary" size="sm" onDark onClick={logout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" onDark>
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Start free</Button>
                </Link>
              </>
            )}
          </div>

          <button
            ref={toggleRef}
            type="button"
            className="md:hidden p-2 -mr-2 text-on-dark rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden fixed inset-0 top-16 bg-ink-950/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              ref={panelRef}
              id="mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden relative bg-navy-900 border-t border-white/10 shadow-xl"
            >
              <Container>
                <nav className="py-4 flex flex-col" aria-label="Mobile">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="font-body text-on-dark py-3 border-b border-white/10"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-3 pt-5 pb-2">
                    {isAuthenticated ? (
                      <Button variant="secondary" onDark fullWidth onClick={logout}>
                        Log out
                      </Button>
                    ) : (
                      <>
                        <Link href="/signup">
                          <Button fullWidth>Start free</Button>
                        </Link>
                        <Link href="/login">
                          <Button variant="secondary" onDark fullWidth>
                            Log in
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </Container>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
