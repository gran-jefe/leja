import axios from 'axios';
import { config } from '../config';

const flw = axios.create({
  baseURL: config.flutterwave.baseUrl,
  headers: {
    Authorization: `Bearer ${config.flutterwave.secretKey}`,
    'Content-Type': 'application/json',
  },
});

interface InitializePaymentParams {
  email: string;
  amount: number;
  reference: string;
  name: string;
  phone?: string;
  redirectUrl: string;
  meta?: Record<string, any>;
}

export async function initializePayment({
  email,
  amount,
  reference,
  name,
  phone,
  redirectUrl,
  meta,
}: InitializePaymentParams): Promise<{ paymentLink: string; reference: string }> {
  try {
    const { data } = await flw.post('/payments', {
      tx_ref: reference,
      amount,
      currency: 'NGN',
      redirect_url: redirectUrl,
      customer: { email, name, phonenumber: phone },
      customizations: {
        title: 'Leja',
        description: 'Tenancy Agreement Payment',
        logo: 'https://leja.ng/logo.png',
      },
      meta: meta || {},
    });

    return { paymentLink: data.data.link, reference };
  } catch (err: any) {
    throw new Error(
      `Flutterwave payment initialization failed: ${err.response?.data?.message || err.message}`
    );
  }
}

export async function verifyPayment(transactionId: string) {
  try {
    const { data } = await flw.get(`/transactions/${transactionId}/verify`);

    return {
      status: data.data.status,
      amount: data.data.amount,
      currency: data.data.currency,
      reference: data.data.tx_ref,
      customer: data.data.customer,
      meta: data.data.meta,
      flwRef: data.data.flw_ref,
    };
  } catch (err: any) {
    throw new Error(
      `Flutterwave payment verification failed: ${err.response?.data?.message || err.message}`
    );
  }
}

export function verifyWebhookSignature(requestHash: string): boolean {
  return requestHash === config.flutterwave.webhookHash;
}

export function generateReference(prefix: string = 'LEJA'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}
