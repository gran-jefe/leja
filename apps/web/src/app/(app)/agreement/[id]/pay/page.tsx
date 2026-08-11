'use client';

import { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { PaymentInstructions } from '@/components/shared/PaymentInstructions';

function AgreementPayment() {
  const { id } = useParams<{ id: string }>();
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
        Go back to the agreement and start the payment again.
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
      onConfirmed={() => router.push(`/agreement/${id}?payment=success`)}
    />
  );
}

export default function AgreementPaymentPage() {
  return (
    // useSearchParams needs a Suspense boundary; this page had none, unlike
    // agreement/[id] which wraps it correctly.
    <div className="max-w-form mx-auto space-y-6">
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        }
      >
        <AgreementPayment />
      </Suspense>
    </div>
  );
}
