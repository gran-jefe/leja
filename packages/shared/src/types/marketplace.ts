export enum ServiceCategory {
  LEGAL = 'LEGAL',
  INSURANCE = 'INSURANCE',
}

export enum ProviderStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum ProviderSubscriptionTier {
  STANDARD = 'STANDARD',
  PRIORITY = 'PRIORITY',
}

export enum ServiceJobStatus {
  OPEN = 'OPEN',
  AWARDED = 'AWARDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum ServiceBidStatus {
  SUBMITTED = 'SUBMITTED',
  WON = 'WON',
  LOST = 'LOST',
  WITHDRAWN = 'WITHDRAWN',
}

export interface IServiceProvider {
  id: string;
  userId: string;
  category: ServiceCategory;
  licenseNumber: string;
  licenseVerified: boolean;
  status: ProviderStatus;
  subscriptionTier: ProviderSubscriptionTier;
  rating?: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceJob {
  id: string;
  agreementId: string;
  category: ServiceCategory;
  requesterId: string;
  status: ServiceJobStatus;
  bidWindowClosesAt: Date;
  minPrice?: number;
  maxPrice?: number;
  winningBidId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceBid {
  id: string;
  jobId: string;
  providerId: string;
  price: number;
  turnaroundHours: number;
  status: ServiceBidStatus;
  createdAt: Date;
  updatedAt: Date;
}
