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
    jwtExpiresIn: '7d',
  },

  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
    baseUrl: 'https://api.paystack.co',
  },

  cors: {
    allowedOrigins: process.env.NODE_ENV === 'production'
      ? ['https://leja.ng', 'https://www.leja.ng', 'https://leja.vercel.app']
      : ['http://localhost:3000', 'http://localhost:3001'],
  },
};

export const validateConfig = () => {
  const requiredFields: [string, string][] = [
    ['db.supabaseUrl', config.db.supabaseUrl],
    ['db.supabaseServiceRoleKey', config.db.supabaseServiceRoleKey],
    ['auth.jwtSecret', config.auth.jwtSecret],
  ];

  // Paystack is required only in production
  if (config.isProduction) {
    requiredFields.push(['paystack.secretKey', config.paystack.secretKey]);
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
