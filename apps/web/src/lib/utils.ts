import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge has to be taught our custom scales, or it silently deletes
 * classes that are not in conflict.
 *
 * Its stock `font-size` matcher only accepts t-shirt sizes (xs/sm/lg/…), so our
 * `text-body`, `text-title`, `text-display-md` etc. fell through to the
 * *text-colour* group instead. Anything of the form `text-<colour>` earlier in
 * the string was then dropped as a duplicate — which is why every Button
 * variant lost its label colour to the size variant's `text-body` and quietly
 * inherited the surrounding surface's colour. On cream that looked fine; on
 * `tertiary` (navy) and `danger` (crimson) the label went invisible.
 *
 * Same trap for `shadow-brass` / `shadow-navy`, which are box-shadow *values*
 * here, not shadow colours.
 *
 * `rounded-card`, `max-w-shell`, `duration-base` and `ease-standard` fail the
 * other way: they match no group at all, so nothing dedupes them and a
 * call-site override is not guaranteed to win — `cn('rounded-card',
 * 'rounded-full')` keeps both and lets stylesheet order decide. Declaring them
 * restores last-one-wins.
 *
 * Rule: any key added to `fontSize`, `boxShadow`, `borderRadius`, `maxWidth`,
 * `transitionDuration` or `transitionTimingFunction` in tailwind.config.ts that
 * is not already a Tailwind default (t-shirt sizes, `prose`, `ease-out`, …)
 * must be mirrored here.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl',
            'display-lg',
            'display-md',
            'display-sm',
            'title',
            'body-lg',
            'body',
            'body-sm',
            'label',
          ],
        },
      ],
      shadow: [{ shadow: ['ring', 'brass', 'navy'] }],
      // Corner-specific forms (`rounded-bl-card`) are not covered — they only
      // appear as one-off static classes, never alongside a competing radius.
      rounded: [{ rounded: ['button', 'card', 'chat', 'chat-mine'] }],
      'max-w': [{ 'max-w': ['form', 'content', 'wide', 'shell'] }],
      duration: [{ duration: ['fast', 'base', 'slow', 'deliberate'] }],
      ease: [{ ease: ['standard'] }],
    },
  },
});

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
      return 'warning';
    case 'EXPIRED':
    case 'DISPUTED':
    case 'TERMINATED':
      return 'danger';
    default:
      return 'default';
  }
};

export const getAgreementStatusLabel = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Agreement Active';
    case 'PENDING_PAYMENT':
      return 'Awaiting Payment';
    case 'DRAFT':
      return 'Draft';
    case 'EXPIRED':
      return 'Expired';
    case 'DISPUTED':
      return 'Disputed';
    case 'TERMINATED':
      return 'Terminated';
    default:
      return status;
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

/** Time only, for chat bubbles — formatDate alone made every message in a
 *  thread read "Aug 10, 2026" with no way to tell them apart. */
export const formatTime = (value?: string | Date | null): string => {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

/** Day separator label for message threads. */
export const formatDayLabel = (value?: string | Date | null): string => {
  if (!value) return '';
  const d = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return formatDate(d);
};
