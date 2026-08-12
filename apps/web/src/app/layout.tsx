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
 *
 * ⚠️ `adjustFontFallback: false` is load-bearing on a Naira-denominated site.
 * Google serves these faces as `U+0-FF` + `U+100-2BA` subsets, and the Naira
 * sign is **U+20A6 — outside both**. Every ₦ therefore renders from the
 * fallback face, and Next's generated fallback carries `size-adjust` /
 * `ascent-override` tuned to the primary font's metrics. Applied to a
 * substituted glyph those overrides squash it, so ₦ visibly collided with the
 * following digit on every price on the site. Disabling the override lets the
 * substituted glyph render at its natural advance.
 *
 * The explicit `fallback` stacks name faces that actually carry U+20A6, so the
 * substitution is a deliberate choice rather than whatever the OS picks.
 */
// next/font is analysed at build time and only accepts literals here — no
// spreads, no shared consts. The duplication is required, not accidental.
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-display',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Georgia', 'Times New Roman', 'Arial Unicode MS', 'serif'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Helvetica Neue', 'Arial Unicode MS', 'Segoe UI', 'system-ui', 'sans-serif'],
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['SF Mono', 'Menlo', 'Consolas', 'DejaVu Sans Mono', 'monospace'],
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
  // No `images` or `icons` keys here on purpose. Next's file-based metadata
  // picks up `app/opengraph-image.tsx`, `app/apple-icon.tsx` and `app/icon.svg`
  // automatically and emits correctly-hashed URLs. The previous hand-written
  // entries pointed at /og.jpg, /favicon.ico and /apple-touch-icon.png — none
  // of which existed, so every share card and touch icon 404'd.
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: siteUrl,
    siteName: 'BeyondAgency',
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
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
