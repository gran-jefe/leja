import type { Metadata, Viewport } from 'next';
import { Fraunces, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { ProgressBar } from '@/components/layout/ProgressBar';

/**
 * Tri-stack: Fraunces (display) + DM Sans (body) + DM Mono (labels/data).
 *
 * Fraunces must declare its axes explicitly — loading it without them (as the
 * previous Google Fonts @import did) leaves the weight axis unavailable, so
 * every bold heading gets synthesised by the browser instead of rendered.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beyondagency.ng';
const title = "BeyondAgency — Nigeria's Trust Platform";
const description =
  'Deal directly, without the risk of dealing directly. BeyondAgency verifies both sides, generates an agreement that holds up, and makes sure money only moves when the terms are met. Starting with rentals.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s · BeyondAgency',
  },
  description,
  applicationName: 'BeyondAgency',
  keywords: [
    'Nigeria rentals',
    'tenancy agreement',
    'property verification',
    'escrow Nigeria',
    'rent without an agent',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: siteUrl,
    siteName: 'BeyondAgency',
    title,
    description,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'BeyondAgency' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF6EE' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1620' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-NG"
      className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="font-body text-body text-ink-700 antialiased">
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}
