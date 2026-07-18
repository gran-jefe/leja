'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#for-landlords', label: 'For Landlords' },
  { href: '/#for-tenants', label: 'For Tenants' },
  { href: '/#pricing', label: 'Pricing' },
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

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleLinks = user?.role === 'LANDLORD' ? landlordLinks : user?.role === 'TENANT' ? tenantLinks : [];

  useEffect(() => {
    if (!isLanding) return;
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  if (!isLanding) {
    return (
      <nav className="bg-navy border-b border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-white">
            Leja
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex gap-6 items-center">
              {roleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-white text-opacity-80 hover:text-opacity-100 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <span className="font-body text-sm text-white text-opacity-70 hidden lg:inline">
                  Welcome, {user?.name}
                </span>
                <Button variant="danger" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm" className="bg-ember hover:bg-opacity-90">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-colors duration-300',
        scrolled ? 'bg-navy/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold text-white">
          Leja
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          {(isAuthenticated ? roleLinks : navLinks).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-sm text-white text-opacity-90 hover:text-opacity-100 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex gap-3 items-center">
          {isAuthenticated ? (
            <Button variant="danger" size="sm" onClick={logout}>
              Logout
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/#book-demo">
                <Button variant="primary" size="sm" className="bg-ember hover:bg-opacity-90">
                  Book a Demo
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-navy/98 backdrop-blur-sm px-4 pb-6 flex flex-col gap-4">
          {(isAuthenticated ? roleLinks : navLinks).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-white py-2 border-b border-white border-opacity-10"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Button variant="danger" className="w-full" onClick={logout}>
              Logout
            </Button>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" className="w-full text-white border-white">
                  Log in
                </Button>
              </Link>
              <Link href="/#book-demo" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" className="w-full bg-ember hover:bg-opacity-90">
                  Book a Demo
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
