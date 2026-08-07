import type { Metadata } from 'next';
import './globals.css';
import { ProgressBar } from '@/components/layout/ProgressBar';

export const metadata: Metadata = {
  title: 'BeyondAgency - Bridging Trust. Simplifying Deals.',
  description: 'Nigeria\'s trust platform for direct deals — landlords and tenants connect free.',
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
