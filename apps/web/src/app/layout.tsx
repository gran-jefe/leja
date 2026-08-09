import type { Metadata } from 'next';
import './globals.css';
import { ProgressBar } from '@/components/layout/ProgressBar';

export const metadata: Metadata = {
  title: 'BeyondAgency — Nigeria\'s Trust Platform-as-a-Service',
  description:
    'BeyondAgency connects the two sides of a deal for free, then earns from a marketplace of vetted providers who compete for the optional work around it. Residential rentals is Phase 1 — insurance, legal, and tech services run on the same platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body text-charcoal">
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}
