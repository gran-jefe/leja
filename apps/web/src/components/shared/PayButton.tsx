'use client';

import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { buildFlwConfig } from '@/lib/flutterwave';

interface PayButtonProps {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  reference: string;
  description?: string;
  label?: string;
  onSuccess: (response: any) => void;
  onClose?: () => void;
  disabled?: boolean;
  className?: string;
}

export function PayButton({
  amount,
  email,
  name,
  phone,
  reference,
  description,
  label = 'Pay with Flutterwave',
  onSuccess,
  onClose,
  disabled,
  className,
}: PayButtonProps) {
  const handleFlutterPayment = useFlutterwave(
    buildFlwConfig({
      amount,
      email,
      name,
      phone,
      reference,
      description,
      onSuccess,
      onClose: onClose || (() => {}),
    })
  );

  const handleClick = () => {
    handleFlutterPayment({
      callback: (response) => {
        if (response.status === 'successful') {
          onSuccess(response);
        }
        closePaymentModal();
      },
      onClose: () => {
        onClose?.();
      },
    });
  };

  return (
    <Button variant="primary" disabled={disabled} onClick={handleClick} className={className}>
      <Lock className="inline-block w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}
