import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...classes: ClassValue[]) => twMerge(clsx(classes));

export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

export const calculateAnnualRent = (monthly: number): number => {
  return monthly * 12;
};

export const getErrorMessage = (err: any, fallback = 'Something went wrong'): string => {
  if (!err?.response) return 'Unable to connect. Please try again.';
  const errors = err.response.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) return errors.join(' ');
  return err.response.data?.message || fallback;
};

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export const getAgreementStatusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PENDING_PAYMENT':
    case 'EXPIRED':
      return 'warning';
    case 'DISPUTED':
    case 'TERMINATED':
      return 'danger';
    default:
      return 'default';
  }
};

export const getLawyerReviewStatusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'PENDING':
    case 'IN_REVIEW':
      return 'warning';
    default:
      return 'default';
  }
};

export const formatDate = (value?: string | Date | null): string => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
