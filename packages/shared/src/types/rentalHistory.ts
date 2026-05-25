export enum RentalHistoryStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TERMINATED_EARLY = 'TERMINATED_EARLY',
}

export interface IRentalHistory {
  id: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  propertyAddress: string;
  startDate: Date;
  endDate?: Date;
  status: RentalHistoryStatus;
  landlordRating?: number;
  tenantRating?: number;
  notes?: string;
  createdAt: Date;
}
