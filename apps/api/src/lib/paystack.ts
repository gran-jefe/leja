import https from 'https';
import { config } from '../config';

interface InitializePaymentParams {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

const paystackRequest = (
  method: 'GET' | 'POST',
  endpoint: string,
  body?: any
): Promise<PaystackResponse> => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: endpoint,
      method,
      headers: {
        Authorization: `Bearer ${config.paystack.secretKey}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

export const initializePayment = async (
  params: InitializePaymentParams
): Promise<any> => {
  const { email, amount, reference, metadata, callbackUrl } = params;

  const body = {
    email,
    amount,
    reference,
    metadata,
    callback_url: callbackUrl,
  };

  const response = await paystackRequest('POST', '/transaction/initialize', body);

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data;
};

export const verifyPayment = async (reference: string): Promise<any> => {
  const response = await paystackRequest(
    'GET',
    `/transaction/verify/${reference}`
  );

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data;
};
