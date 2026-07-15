export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  db: {
    url: process.env.DATABASE_URL || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: '7d' as const,
  },

  flutterwave: {
    secretKey: process.env.FLW_SECRET_KEY || '',
    publicKey: process.env.FLW_PUBLIC_KEY || '',
    webhookHash: process.env.FLW_WEBHOOK_HASH || '',
    baseUrl: 'https://api.flutterwave.com/v3',
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
