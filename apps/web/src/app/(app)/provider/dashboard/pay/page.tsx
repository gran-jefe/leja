'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { PaymentInstructions } from '@/components/shared/PaymentInstructions';

function SubscriptionPayment() {
  const router = useRouter();
  const params = useSearchParams();

  const reference = params.get('reference') || '';
  const accountNumber = params.get('accountNumber') || '';
  const accountName = params.get('accountName') || '';
  const bankName = params.get('bankName') || '';
  const amount = Number(params.get('amount') || 0);

  if (!reference || !accountNumber) {
    return (
      <Alert tone="warning" title="Missing payment details">
        Go back to your dashboard and start the subscription again.
      </Alert>
    );
  }

  return (
    <PaymentInstructions
      reference={reference}
      accountNumber={accountNumber}
      accountName={accountName}
      bankName={bankName}
      amount={amount}
      onConfirmed={() => router.push('/provider/dashboard?subscription=success')}
    />
  );
}

export default function ProviderSubscriptionPaymentPage() {
  return (
    <div className="max-w-form mx-auto space-y-6">
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        }
      >
        <SubscriptionPayment />
      </Suspense>
    </div>
  );
}
