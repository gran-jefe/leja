'use client';

import { useState } from 'react';
import { CheckCircle, Landmark } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconTile } from '@/components/ui/IconTile';
import { CopyButton } from '@/components/ui/CopyButton';
import { Alert } from '@/components/ui/Alert';
import { formatNaira } from '@/lib/utils';
import api from '@/lib/api';

// Shared account-transfer instructions UI backing eTranzact's virtual-account
// collection model (no hosted checkout page to redirect to, unlike the
// previous Flutterwave integration — see apps/api/src/lib/payments/etranzact.ts).
// Used by both the agreement lawyer-review payment step and the provider
// subscription payment step.
export function PaymentInstructions({
  reference,
  accountNumber,
  accountName,
  bankName,
  amount,
  onConfirmed,
}: {
  reference: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  amount: number;
  onConfirmed: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const checkPaymentStatus = async () => {
    setChecking(true);
    try {
      const { data } = await api.post(`/payments/verify/${reference}`);
      if (data?.data?.status === 'successful') {
        setConfirmed(true);
        setTimeout(onConfirmed, 1200);
      }
    } catch {
      // Non-fatal — the payer can just try again in a moment.
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <IconTile icon={Landmark} tone="brass" size="sm" />
        <h1 className="font-display text-title font-semibold text-navy-900">
          Transfer to complete payment
        </h1>
      </div>

      <p className="font-body text-body-sm text-ink-500 mb-6">
        Transfer{' '}
        <strong className="font-mono tabular-nums text-ink-800">{formatNaira(amount)}</strong> to
        the account below. This is a one-time account generated for this payment — confirmation is
        usually instant once the transfer lands.
      </p>

      <dl className="bg-ink-50 border border-ink-200 rounded-card p-4 mb-6 space-y-3">
        <div className="flex justify-between items-center gap-4">
          <dt className="font-body text-body-sm text-ink-500">Bank</dt>
          <dd className="font-body text-body-sm font-semibold text-navy-900">{bankName}</dd>
        </div>
        <div className="flex justify-between items-center gap-4">
          <dt className="font-body text-body-sm text-ink-500">Account number</dt>
          <dd className="flex items-center gap-1">
            <span className="font-mono tabular-nums font-medium text-navy-900 tracking-wide">
              {accountNumber}
            </span>
            <CopyButton value={accountNumber} label="" />
          </dd>
        </div>
        <div className="flex justify-between items-center gap-4">
          <dt className="font-body text-body-sm text-ink-500">Account name</dt>
          <dd className="font-body text-body-sm font-semibold text-navy-900 text-right">
            {accountName}
          </dd>
        </div>
      </dl>

      {confirmed ? (
        <Alert tone="success" title="Payment confirmed">
          Taking you back now…
        </Alert>
      ) : (
        <Button
          fullWidth
          loading={checking}
          onClick={checkPaymentStatus}
          leadingIcon={<CheckCircle size={17} />}
        >
          I&apos;ve made this transfer
        </Button>
      )}

      <p className="font-body text-body-sm text-ink-400 mt-4 text-center">
        We&apos;ll also confirm automatically in the background once the transfer is received.
      </p>
    </Card>
  );
}
