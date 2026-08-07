export const FLW_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || '';

export interface FlutterwaveConfig {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  reference: string;
  description?: string;
  onSuccess: (response: any) => void;
  onClose: () => void;
}

export function buildFlwConfig(options: FlutterwaveConfig) {
  return {
    public_key: FLW_PUBLIC_KEY,
    tx_ref: options.reference,
    amount: options.amount, // Naira — no conversion
    currency: 'NGN',
    payment_options: 'card,ussd,banktransfer',
    customer: {
      email: options.email,
      name: options.name,
      phone_number: options.phone || '',
    },
    customizations: {
      title: 'BeyondAgency',
      description: options.description || 'Tenancy Agreement Payment',
      // TODO(MIGRATION_NOTES): logo asset still lives on the old domain
      logo: 'https://leja.ng/logo.png',
    },
  };
}
