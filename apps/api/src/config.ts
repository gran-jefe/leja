export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  db: {
    // .trim() defensively — a stray leading/trailing space pasted into a
    // dashboard env var (Render, Vercel, etc.) silently breaks
    // createClient()'s URL parsing and manifests as an opaque
    // "TypeError: fetch failed" with no useful stack, so we guard against
    // it here rather than relying on every env var being pasted cleanly.
    url: (process.env.DATABASE_URL || '').trim(),
    supabaseUrl: (process.env.SUPABASE_URL || '').trim(),
    supabaseAnonKey: (process.env.SUPABASE_ANON_KEY || '').trim(),
    supabaseServiceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
  },

  auth: {
    jwtSecret: (process.env.JWT_SECRET || '').trim(),
    jwtExpiresIn: '7d' as const,
  },

  flutterwave: {
    secretKey: (process.env.FLW_SECRET_KEY || '').trim(),
    publicKey: (process.env.FLW_PUBLIC_KEY || '').trim(),
    webhookHash: (process.env.FLW_WEBHOOK_HASH || '').trim(),
    baseUrl: 'https://api.flutterwave.com/v3',
  },

  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3000').trim(),

  // No dedicated ADMIN role exists in the schema — admin-only marketplace
  // routes (provider verification, internal staff onboarding) gate on this
  // allowlist instead. See ADMIN_EMAILS in .env.example.
  admin: {
    emails: (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  },

  // Optional — email notifications (e.g. "you got a new message") degrade
  // to a no-op (logged, not sent) when RESEND_API_KEY isn't set, so this
  // is never a hard requirement to run the app. See lib/email.ts.
  //
  // fromAddress defaults to Resend's sandbox sender (onboarding@resend.dev)
  // because sending "from" any address requires verifying you own that
  // domain — a gmail.com address can never be a from-address here.
  // replyToAddress is where actual replies should land instead; defaults
  // to a personal inbox so "reply" on a notification email works without
  // needing a verified custom domain yet.
  email: {
    resendApiKey: (process.env.RESEND_API_KEY || '').trim(),
    fromAddress: (process.env.EMAIL_FROM || 'BeyondAgency <onboarding@resend.dev>').trim(),
    replyToAddress: (process.env.EMAIL_REPLY_TO || 'granjefetech@gmail.com').trim(),
  },

  cors: {
    allowedOrigins:
      process.env.NODE_ENV === 'production'
        ? [
            'https://leja.ng',
            'https://leja-web.vercel.app',
            'https://www.leja.ng',
          ]
        : ['http://localhost:3000', 'http://localhost:3001'],
  },
};

export const validateConfig = () => {
  const requiredFields: [string, string][] = [
    ['db.supabaseUrl', config.db.supabaseUrl],
    ['db.supabaseServiceRoleKey', config.db.supabaseServiceRoleKey],
    ['auth.jwtSecret', config.auth.jwtSecret],
  ];

  // Flutterwave is required only in production
  if (config.isProduction) {
    requiredFields.push(['flutterwave.secretKey', config.flutterwave.secretKey]);
    requiredFields.push(['flutterwave.webhookHash', config.flutterwave.webhookHash]);
  }

  const missing = requiredFields
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please set these in your .env file or on your hosting platform.`
    );
  }
};
