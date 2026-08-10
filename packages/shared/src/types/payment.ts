export enum PaymentType {
  TENANT_MOVE_IN_FEE = 'TENANT_MOVE_IN_FEE',
  TENANT_LAWYER_REVIEW = 'TENANT_LAWYER_REVIEW',
  RENTAL_HISTORY_EXPORT = 'RENTAL_HISTORY_EXPORT',
  LANDLORD_SUBSCRIPTION = 'LANDLORD_SUBSCRIPTION',
  PROVIDER_SUBSCRIPTION = 'PROVIDER_SUBSCRIPTION',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface IPayment {
  id: string;
  userId: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  paymentReference: string; // internal reference passed to the active payment provider (eTranzact); previously named paystackReference/flutterwave tx_ref
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Shape returned by initializePayment() on the API, forwarded as-is to the
// frontend in `data.payment`. Discriminated by `mode` because different
// payment rails collect money differently — see apps/api/src/lib/payments/types.ts
// for the authoritative definition and the reasoning behind the split.
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
      expiresAt?: string;
    };
