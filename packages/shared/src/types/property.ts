export enum PropertyType {
  SELF_CONTAIN = 'SELF_CONTAIN',
  ONE_BEDROOM = 'ONE_BEDROOM',
  TWO_BEDROOM = 'TWO_BEDROOM',
  THREE_BEDROOM = 'THREE_BEDROOM',
  DUPLEX = 'DUPLEX',
  BUNGALOW = 'BUNGALOW',
  FLAT = 'FLAT',
}

export interface IProperty {
  id: string;
  landlordId: string;
  address: string;
  city: string;
  state: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  annualRent: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
