export enum InsuranceProductType {
  RENT_PROTECTION = 'RENT_PROTECTION',
}

export enum InsuranceInterestStatus {
  INTERESTED = 'INTERESTED',
  CONTACTED = 'CONTACTED',
  DECLINED = 'DECLINED',
}

export interface IInsuranceInterest {
  id: string;
  agreementId: string;
  tenantId: string;
  productType: InsuranceProductType;
  status: InsuranceInterestStatus;
  createdAt: Date;
}
