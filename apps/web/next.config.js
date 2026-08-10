/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // No client-side payment SDK key needed — eTranzact's virtual-account
    // model is server-initiated only (see PaymentInstructions component),
    // unlike the removed Flutterwave inline-modal integration.
  },
};

module.exports = nextConfig;
