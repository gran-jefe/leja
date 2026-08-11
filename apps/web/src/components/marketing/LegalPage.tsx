import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { Container } from '@/components/layout/Container';
import { Alert } from '@/components/ui/Alert';

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for /terms and /privacy.
 *
 * These pages exist because the footer linked both to `href="#"`, which is a
 * credibility problem for a platform asking people to sign binding
 * agreements. The content below is a scaffold, not reviewed legal copy — the
 * notice makes that explicit rather than letting a placeholder pass as final.
 */
export function LegalPage({ title, updated, intro, children }: LegalPageProps) {
  return (
    <>
      <Navbar />
      <main className="bg-paper pt-24 pb-24">
        <Container width="content">
          <p className="font-mono text-label uppercase text-brass-700 mb-4">Legal</p>
          <h1 className="font-display text-display-lg font-semibold text-navy-900 mb-3">{title}</h1>
          <p className="font-mono text-body-sm text-ink-400 mb-8">Last updated {updated}</p>

          <Alert tone="warning" title="Draft — not yet reviewed by counsel" className="mb-10">
            This document is a working scaffold so the structure and obligations are visible. It
            must be reviewed by a qualified Nigerian legal practitioner before launch.
          </Alert>

          <p className="font-body text-body-lg text-ink-600 mb-10">{intro}</p>

          <div className="space-y-8">{children}</div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-ink-200 pt-8">
      <h2 className="font-display text-title font-semibold text-navy-900 mb-3">{heading}</h2>
      <div className="font-body text-ink-600 space-y-3">{children}</div>
    </section>
  );
}
