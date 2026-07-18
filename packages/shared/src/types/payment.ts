export enum PaymentType {
  TENANT_MOVE_IN_FEE = 'TENANT_MOVE_IN_FEE',
  TENANT_LAWYER_REVIEW = 'TENANT_LAWYER_REVIEW',
  RENTAL_HISTORY_EXPORT = 'RENTAL_HISTORY_EXPORT',
  LANDLORD_SUBSCRIPTION = 'LANDLORD_SUBSCRIPTION',
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
  paystackReference: string; // legacy name, now stores the Flutterwave tx_ref
  metadata?: Record<string, any>;
  createdAt: Date;
}
