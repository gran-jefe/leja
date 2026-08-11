import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck, Landmark, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

/**
 * Split-screen auth chrome. Replaces the previous centred-card-on-flat-navy
 * layout that login and signup each implemented separately, along with a
 * byte-identical trust row that carried a hardcoded `text-[#A0AEC0]`.
 */
const trustPoints = [
  { icon: ShieldCheck, text: 'Identity verified with BVN or NIN' },
  { icon: FileCheck, text: 'State-compliant tenancy agreements' },
  // Replaces "Bank-grade security", which was unverifiable boilerplate.
  { icon: Landmark, text: 'Payments never touch our hands' },
];

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthLayout({ eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Brand panel — hidden on mobile, where it would push the form below
          the fold for no benefit. */}
      <aside className="relative hidden lg:flex flex-col justify-between bg-navy-950 bg-grain p-12 overflow-hidden">
        <svg
          aria-hidden
          className="absolute -left-32 top-1/2 -translate-y-1/2 h-[130%] w-auto text-brass-500"
          viewBox="0 0 600 600"
          fill="none"
        >
          <circle cx="300" cy="300" r="290" stroke="currentColor" strokeWidth="1" opacity="0.12" />
          <circle cx="300" cy="300" r="220" stroke="currentColor" strokeWidth="1" opacity="0.09" />
          <circle cx="300" cy="300" r="150" stroke="currentColor" strokeWidth="1.5" opacity="0.14" />
        </svg>

        <div className="relative">
          <Link href="/" aria-label="BeyondAgency home">
            <Logo onDark size="md" />
          </Link>
        </div>

        <div className="relative max-w-md">
          <p className="font-display text-display-md font-semibold text-on-dark mb-4">
            Deal directly. Without the risk of dealing directly.
          </p>
          <p className="font-body text-on-dark-muted">
            Verified parties, agreements that hold up, and money that moves only when the terms are
            met.
          </p>
        </div>

        <ul className="relative space-y-3">
          {trustPoints.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 font-body text-body-sm text-on-dark-muted">
              <Icon size={17} className="text-brass-500 flex-shrink-0" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col justify-center bg-paper px-5 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-form mx-auto">
          <div className="lg:hidden mb-10">
            <Link href="/" aria-label="BeyondAgency home">
              <Logo size="sm" />
            </Link>
          </div>

          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 font-body text-body-sm text-ink-500 hover:text-ink-700 transition-colors mb-10"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>

          <p className="font-mono text-label uppercase text-brass-700 mb-3">{eyebrow}</p>
          <h1 className="font-display text-display-sm sm:text-display-md font-semibold text-navy-900 mb-2">
            {title}
          </h1>
          {subtitle && <p className="font-body text-ink-500 mb-8">{subtitle}</p>}
          {!subtitle && <div className="mb-8" />}

          {children}

          <div className="mt-6 font-body text-body-sm text-ink-500 text-center">{footer}</div>
        </div>
      </main>
    </div>
  );
}
