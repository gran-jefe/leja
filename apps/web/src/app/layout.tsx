import type { Metadata } from 'next';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}
