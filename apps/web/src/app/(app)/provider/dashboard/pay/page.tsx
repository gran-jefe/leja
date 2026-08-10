'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { PaymentInstructions } from '@/components/shared/PaymentInstructions';

export default function ProviderSubscriptionPaymentPage() {
  const router = useRouter();
  const params = useSearchParams();

  const reference = params.get('reference') || '';
  const accountNumber = params.get('accountNumber') || '';
  const accountName = params.get('accountName') || '';
  const bankName = params.get('bankName') || '';
  const amount = Number(params.get('amount') || 0);

  if (!reference || !accountNumber) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <p className="font-body text-charcoal">
            Missing payment details. Go back to your dashboard and try again.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <PaymentInstructions
        reference={reference}
        accountNumber={accountNumber}
        accountName={accountName}
        bankName={bankName}
        amount={amount}
        onConfirmed={() => router.push('/provider/dashboard?subscription=success')}
      />
    </div>
  );
}
