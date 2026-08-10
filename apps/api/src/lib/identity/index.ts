import { stubKycProvider } from './stub';
import type { KycProvider } from './types';

export * from './types';

// Single switch point, same pattern as ../payments/index.ts. Add a real
// provider file next to stub.ts, add it to this map, and flip
// KYC_PROVIDER — no route/query file should ever need to change.
const PROVIDERS: Record<string, KycProvider> = {
  stub: stubKycProvider,
};

const activeProvider = PROVIDERS[process.env.KYC_PROVIDER || 'stub'];

if (!activeProvider) {
  throw new Error(
    `Unknown KYC_PROVIDER "${process.env.KYC_PROVIDER}" — expected one of: ${Object.keys(PROVIDERS).join(', ')}`
  );
}

if (activeProvider.name === 'stub' && process.env.NODE_ENV === 'production') {
  console.error(
    '[IDENTITY] WARNING: stub KYC provider is active in production. Real identity verification is not happening. Set KYC_PROVIDER once a real provider is integrated.'
  );
}

export const verifyTier1 = activeProvider.verifyTier1.bind(activeProvider);
export const verifyTier2 = activeProvider.verifyTier2.bind(activeProvider);
export const activeKycProviderName = activeProvider.name;
