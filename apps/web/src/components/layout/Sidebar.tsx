'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => pathname === href;

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/agreements', label: 'Agreements' },
    ...(user?.role === 'LANDLORD'
      ? [{ href: '/properties', label: 'Properties' }]
      : []),
    ...(user?.role === 'TENANT'
      ? [{ href: '/rental-history', label: 'Rental History' }]
      : []),
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <aside className="w-64 bg-cream border-r border-border min-h-screen p-4">
      <div className="font-display text-xl font-bold text-navy mb-8">Leja</div>
      <nav className="space-y-2">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'block px-4 py-2 rounded-button font-body text-sm transition-colors',
              isActive(href)
                ? 'bg-forest text-white'
                : 'text-charcoal hover:bg-white'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
