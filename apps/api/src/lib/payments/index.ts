import { etranzactProvider } from './etranzact';
import type { PaymentProvider } from './types';

export * from './types';

// Single switch point for the active payment rail. Adding a new provider
// later means writing a new file next to etranzact.ts that implements
// PaymentProvider, then adding it to this map — no route/query file should
// ever need to change.
const PROVIDERS: Record<string, PaymentProvider> = {
  etranzact: etranzactProvider,
};

const activeProvider = PROVIDERS[process.env.PAYMENT_PROVIDER || 'etranzact'];

if (!activeProvider) {
  throw new Error(
    `Unknown PAYMENT_PROVIDER "${process.env.PAYMENT_PROVIDER}" — expected one of: ${Object.keys(PROVIDERS).join(', ')}`
  );
}

export const initializePayment = activeProvider.initializePayment.bind(activeProvider);
export const verifyPayment = activeProvider.verifyPayment.bind(activeProvider);
export const verifyWebhookSignature = activeProvider.verifyWebhookSignature.bind(activeProvider);
export const activePaymentProviderName = activeProvider.name;
