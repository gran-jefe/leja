export enum AgreementStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DISPUTED = 'DISPUTED',
  TERMINATED = 'TERMINATED',
}

export enum LawyerReviewStatus {
  NOT_REQUESTED = 'NOT_REQUESTED',
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
}

export interface IAgreement {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  annualRent: number;
  status: AgreementStatus;
  pdfUrl?: string;
  lawyerReviewStatus: LawyerReviewStatus;
  lawyerReviewId?: string;
  paymentReference?: string;
  createdAt: Date;
  updatedAt: Date;
}
