'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/lib/utils';
import { CheckCircle, Copy, Landmark } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const copyAccountNumber = async () => {
    await navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <div className="w-10 h-10 rounded-button bg-forest bg-opacity-10 flex items-center justify-center">
          <Landmark className="text-forest" size={20} />
        </div>
        <h1 className="font-display text-xl font-bold text-navy">Transfer to Complete Payment</h1>
      </div>

      <p className="font-body text-sm text-muted mb-6">
        Transfer <strong className="text-charcoal">{formatNaira(amount)}</strong> to the account below. This
        is a one-time account generated for this payment — confirmation is usually instant once the transfer
        lands.
      </p>

      <div className="bg-cream border border-border rounded-card p-4 mb-6 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-body text-sm text-muted">Bank</span>
          <span className="font-body text-sm font-semibold text-navy">{bankName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body text-sm text-muted">Account Number</span>
          <button
            onClick={copyAccountNumber}
            className="flex items-center gap-1 font-body text-sm font-semibold text-navy hover:text-forest"
          >
            {accountNumber}
            <Copy size={14} />
          </button>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body text-sm text-muted">Account Name</span>
          <span className="font-body text-sm font-semibold text-navy">{accountName}</span>
        </div>
        {copied && <p className="text-xs text-forest font-body">Account number copied</p>}
      </div>

      {confirmed ? (
        <div className="flex items-center gap-2 text-forest font-body text-sm">
          <CheckCircle size={18} />
          Payment confirmed — redirecting...
        </div>
      ) : (
        <Button variant="primary" className="w-full" loading={checking} onClick={checkPaymentStatus}>
          I've made this transfer
        </Button>
      )}

      <p className="font-body text-xs text-muted mt-4 text-center">
        We'll also confirm automatically in the background once the transfer is received.
      </p>
    </Card>
  );
}
