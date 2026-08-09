export enum UserRole {
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
  PROVIDER = 'PROVIDER',
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
