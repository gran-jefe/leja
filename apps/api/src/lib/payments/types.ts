// Provider-agnostic payments contract. Every payment rail (eTranzact today,
// anything else later) implements this interface so routes/queries never
// import a specific provider's SDK/client directly — swapping rails again
// in the future should mean writing one new file here, not touching every
// route that collects money.
//
// The two rails seen in this codebase's history have genuinely different
// collection models, which is why `initializePayment` returns a discriminated
// union rather than a single shape:
//  - Flutterwave (removed): hosted checkout — returns a redirect `paymentLink`,
//    user pays on Flutterwave's page, webhook confirms.
//  - eTranzact (current): generates a dedicated virtual bank account per
//    transaction — user transfers into that account, we confirm via the
//    transaction-verification endpoint (see etranzact.ts for the exact
//    calls). There is no hosted redirect page in this model.

export interface InitializePaymentParams {
  email: string;
  amount: number; // Naira, never kobo — see CLAUDE.md monetary storage rules
  reference: string;
  name: string;
  phone?: string;
  redirectUrl: string;
  meta?: Record<string, any>;
}

export type PaymentInitiationResult =
  | {
      mode: 'redirect';
      paymentLink: string;
      reference: string;
    }
  | {
      mode: 'account_transfer';
      reference: string;
      accountNumber: string;
      accountName: string;
      bankName: string;
      amount: number;
      /** Dynamic virtual accounts are typically short-lived — surface this so the UI can show a countdown / re-generate. */
      expiresAt?: string;
    };

export interface VerifiedPaymentResult {
  status: 'successful' | 'pending' | 'failed';
  amount: number;
  currency: string;
  reference: string;
  customer?: Record<string, any>;
  meta?: Record<string, any>;
  providerRef?: string;
}

export interface PaymentProvider {
  readonly name: string;
  initializePayment(params: InitializePaymentParams): Promise<PaymentInitiationResult>;
  /** `reference` is our own internal reference (the same one passed into initializePayment), not a provider-specific transaction ID. */
  verifyPayment(reference: string): Promise<VerifiedPaymentResult>;
  /** Validates an inbound webhook/notification call is genuinely from the provider. Shape of `req` data varies by provider — implementations inspect headers/body as needed. */
  verifyWebhookSignature(headerValue: string | undefined, body?: unknown): boolean;
}

export function generateReference(prefix: string = 'BEYOND'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}
