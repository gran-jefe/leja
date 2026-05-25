export enum PaymentType {
  AGREEMENT_BASIC = 'AGREEMENT_BASIC',
  AGREEMENT_REVIEWED = 'AGREEMENT_REVIEWED',
  SUBSCRIPTION = 'SUBSCRIPTION',
  RENTAL_HISTORY = 'RENTAL_HISTORY',
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
  paystackReference: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
