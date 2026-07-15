import type { Metadata } from 'next';
import './globals.css';
import { ProgressBar } from '@/components/layout/ProgressBar';

export const metadata: Metadata = {
  title: 'Leja - Rent with confidence',
  description: 'Nigeria\'s residential rental transaction platform',
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
