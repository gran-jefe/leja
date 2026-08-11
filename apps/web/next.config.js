/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // No client-side payment SDK key needed — eTranzact's virtual-account
    // model is server-initiated only (see PaymentInstructions component),
    // unlike the removed Flutterwave inline-modal integration.
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Supabase Storage (bucket: agreements / property photos). The wildcard
    // covers any project ref without needing SUPABASE_URL set on Vercel, where
    // only NEXT_PUBLIC_* vars are configured.
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '*.supabase.in', pathname: '/storage/v1/object/public/**' },
    ],
    // NOTE for Phase C: property photos are currently landlord-typed URL text
    // fields, so they can point at arbitrary hosts that are not on this
    // allowlist. Any <Image> used for them must fall back to an unoptimised
    // render for non-allowlisted origins, or photos need to move to Supabase
    // Storage uploads first.
    deviceSizes: [375, 640, 768, 1024, 1280, 1536, 1920],
  },
};

module.exports = nextConfig;
