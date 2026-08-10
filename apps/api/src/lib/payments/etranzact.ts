import axios from 'axios';
import { config } from '../../config';
import type {
  PaymentProvider,
  InitializePaymentParams,
  PaymentInitiationResult,
  VerifiedPaymentResult,
} from './types';

// eTranzact Virtual Account (Virtual Funding) integration.
// Docs: https://developers.etranzactng.com/category/virtual-account
//
// Collection model is fundamentally different from Flutterwave's hosted
// checkout: instead of redirecting the payer to a hosted page, we generate
// a dedicated ("dynamic") virtual bank account per transaction. The payer
// transfers into that account (bank app, USSD, etc.) and we confirm receipt
// via the transaction-verify endpoint. There is no card/USSD-in-browser flow
// here — see types.ts for why initializePayment returns a discriminated
// union rather than always a redirect link.
//
// NOTE ON WEBHOOKS: eTranzact's public docs (crawled at integration time)
// document a "Notifications" API for configuring admin alert emails/SMS
// templates, but do not expose a documented merchant-facing webhook payload
// schema for "virtual account funded" events in the same way Flutterwave's
// `charge.completed` event is documented. Until that's confirmed directly
// with eTranzact support/account manager, `verifyWebhookSignature` below is
// a conservative placeholder (shared-secret header check) and the safe path
// is polling `verifyPayment()` (GET /transaction/verify) rather than trusting
// an inbound call alone to mark a payment successful. Do not remove the
// polling fallback in routes/payments.ts until a real webhook contract is
// confirmed and tested against eTranzact's sandbox.

const etz = axios.create({
  baseURL: config.etranzact.baseUrl,
  headers: {
    Authorization: `Bearer ${config.etranzact.secretKey}`,
    'Content-Type': 'application/json',
  },
});

export const etranzactProvider: PaymentProvider = {
  name: 'etranzact',

  async initializePayment({
    email,
    amount,
    reference,
    name,
    meta,
  }: InitializePaymentParams): Promise<PaymentInitiationResult> {
    try {
      const { data } = await etz.post('/account', {
        productCode: config.etranzact.productCode,
        accountType: 0, // dynamic — single-use, per-transaction account
        accountName: name,
        customerID: reference, // our internal reference doubles as eTranzact's customerID so verify/query can look it up later
        accountLimit: amount,
      });

      if (data?.status !== 201 || !data?.data?.accountNo) {
        throw new Error(data?.message || 'eTranzact did not return a virtual account');
      }

      return {
        mode: 'account_transfer',
        reference,
        accountNumber: data.data.accountNo,
        accountName: data.data.accountName || name,
        bankName: data.data.bank || 'Providus',
        amount,
        expiresAt: data.data.expiringAt,
      };
    } catch (err: any) {
      throw new Error(
        `eTranzact virtual account generation failed: ${err.response?.data?.message || err.message}`
      );
    }
  },

  async verifyPayment(reference: string): Promise<VerifiedPaymentResult> {
    try {
      // Look up by customerID (== our reference, see initializePayment above)
      // across recent successful transfers into the generated account.
      const { data } = await etz.get('/transaction/all', {
        params: {
          productCode: config.etranzact.productCode,
          customerID: reference,
          tranStatus: '00', // 00 = success per eTranzact's docs
        },
      });

      const tx = data?.data?.[0];
      if (!tx) {
        return { status: 'pending', amount: 0, currency: 'NGN', reference };
      }

      return {
        status: 'successful',
        amount: tx.transactionAmount,
        currency: tx.currency || 'NGN',
        reference,
        providerRef: tx.sessionId,
        meta: { settledAmount: tx.settledAmount, feeAmount: tx.feeAmount },
      };
    } catch (err: any) {
      throw new Error(
        `eTranzact payment verification failed: ${err.response?.data?.message || err.message}`
      );
    }
  },

  verifyWebhookSignature(headerValue: string | undefined): boolean {
    // Placeholder shared-secret check — see the file-level note above.
    // Swap for eTranzact's actual signature scheme once confirmed; until
    // then treat any webhook hit as a trigger to re-verify via
    // verifyPayment() rather than trusting the payload directly.
    return !!headerValue && headerValue === config.etranzact.webhookSecret;
  },
};
