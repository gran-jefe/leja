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

  // Payment rail: eTranzact, replacing Flutterwave (removed) as of the
  // payments-layer swap. See apps/api/src/lib/payments/ for the
  // provider-agnostic interface this backs — routes/queries never import
  // this config or an SDK directly, only ../lib/payments.
  etranzact: {
    secretKey: (process.env.ETRANZACT_SECRET_KEY || '').trim(),
    productCode: (process.env.ETRANZACT_PRODUCT_CODE || '').trim(),
    webhookSecret: (process.env.ETRANZACT_WEBHOOK_SECRET || '').trim(),
    // eTranzact's docs reference a demo host (demo.etranzact.com); override
    // via env once production credentials/host are issued.
    baseUrl: (process.env.ETRANZACT_BASE_URL || 'https://demo.etranzact.com/virtual-funding').trim(),
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

  // Payment rail credentials are required only in production
  if (config.isProduction) {
    requiredFields.push(['etranzact.secretKey', config.etranzact.secretKey]);
    requiredFields.push(['etranzact.productCode', config.etranzact.productCode]);
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
