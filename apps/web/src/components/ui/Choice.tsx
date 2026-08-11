'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ACCESSIBILITY FIX — the reason this file exists.
 *
 * Four places in the app styled selectable options by putting the real control
 * behind `className="hidden"`:
 *   agreement/new (property picker), properties/browse (bedroom pills),
 *   properties/new + properties/[id]/edit (amenity checkboxes).
 *
 * `display: none` removes an input from the tab order entirely, so the
 * agreement wizard's property choice was unreachable by keyboard. The fix is
 * `sr-only` + `peer`, which keeps the control focusable and lets the visual
 * state be driven by `peer-checked:` / `peer-focus-visible:`.
 *
 * NOTE: `peer-checked:` compiles to `.peer:checked ~ .target`, a SIBLING
 * selector. It cannot reach nested elements directly — nested state has to go
 * through an arbitrary variant on the sibling, e.g.
 * `peer-checked:[&_[data-check]]:opacity-100`.
 */

const controlBase = 'sr-only peer';

const focusRing =
  'peer-focus-visible:ring-2 peer-focus-visible:ring-brass-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper';

const surfaceBase = cn(
  'cursor-pointer transition-all duration-fast ease-standard',
  focusRing,
  'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed'
);

/* ------------------------------------------------------------------ Chip -- */

interface ChoiceChipProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  type?: 'radio' | 'checkbox';
}

/** Compact pill. For filters, amenity tags, short option sets. */
export const ChoiceChip = React.forwardRef<HTMLInputElement, ChoiceChipProps>(
  ({ label, type = 'radio', className, ...props }, ref) => (
    <label className="inline-flex">
      <input ref={ref} type={type} className={controlBase} {...props} />
      <span
        className={cn(
          surfaceBase,
          'inline-flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-button border font-body text-body-sm',
          'border-ink-200 text-ink-600 bg-white hover:border-ink-300',
          'peer-checked:bg-navy-900 peer-checked:text-on-dark peer-checked:border-navy-900',
          className
        )}
      >
        {label}
      </span>
    </label>
  )
);
ChoiceChip.displayName = 'ChoiceChip';

/* ------------------------------------------------------------------ Card -- */

interface ChoiceCardProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  type?: 'radio' | 'checkbox';
}

/** Full-width selectable card. For property pickers, role choice, plans. */
export const ChoiceCard = React.forwardRef<HTMLInputElement, ChoiceCardProps>(
  ({ label, description, meta, type = 'radio', className, ...props }, ref) => (
    <label className="block">
      <input ref={ref} type={type} className={controlBase} {...props} />
      <span
        className={cn(
          surfaceBase,
          'flex items-start gap-3 p-4 rounded-card border bg-white',
          'border-ink-200 hover:border-ink-300 hover:shadow-xs',
          'peer-checked:border-brass-500 peer-checked:bg-brass-50 peer-checked:shadow-xs',
          // nested marker + tick, reached via arbitrary variants
          'peer-checked:[&_[data-marker]]:border-brass-500 peer-checked:[&_[data-marker]]:bg-brass-500',
          'peer-checked:[&_[data-check]]:opacity-100',
          className
        )}
      >
        <span
          data-marker
          aria-hidden
          className={cn(
            'flex-shrink-0 mt-0.5 w-5 h-5 border-2 border-ink-300 flex items-center justify-center transition-colors duration-fast',
            type === 'radio' ? 'rounded-full' : 'rounded-sm'
          )}
        >
          <Check data-check size={12} strokeWidth={3} className="text-ink-950 opacity-0 transition-opacity duration-fast" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-body font-semibold text-ink-800">{label}</span>
          {description && (
            <span className="block font-body text-body-sm text-ink-500 mt-0.5">{description}</span>
          )}
        </span>
        {meta && <span className="flex-shrink-0 font-mono text-body-sm text-ink-600">{meta}</span>}
      </span>
    </label>
  )
);
ChoiceCard.displayName = 'ChoiceCard';

/* -------------------------------------------------------------- Checkbox -- */

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, ...props }, ref) => (
    <label className={cn('flex items-start gap-3 cursor-pointer', className)}>
      <input ref={ref} type="checkbox" className={controlBase} {...props} />
      <span
        data-marker
        aria-hidden
        className={cn(
          surfaceBase,
          'flex-shrink-0 mt-0.5 w-[18px] h-[18px] rounded-sm border-2 border-ink-300 bg-white',
          'flex items-center justify-center',
          'peer-checked:bg-brass-500 peer-checked:border-brass-500',
          'peer-checked:[&_[data-check]]:opacity-100'
        )}
      >
        <Check
          data-check
          size={12}
          strokeWidth={3}
          className="text-ink-950 opacity-0 transition-opacity duration-fast"
        />
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block font-body text-ink-800">{label}</span>}
          {description && (
            <span className="block font-body text-body-sm text-ink-500 mt-0.5">{description}</span>
          )}
        </span>
      )}
    </label>
  )
);
Checkbox.displayName = 'Checkbox';

/* ---------------------------------------------------------------- Switch -- */

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, ...props }, ref) => (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer', className)}>
      <input ref={ref} type="checkbox" role="switch" className={controlBase} {...props} />
      <span
        aria-hidden
        className={cn(
          surfaceBase,
          'relative w-11 h-6 rounded-full bg-ink-200 flex-shrink-0',
          'peer-checked:bg-brass-500',
          'peer-checked:[&_[data-knob]]:translate-x-5'
        )}
      >
        <span
          data-knob
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-fast ease-standard"
        />
      </span>
      {label && <span className="font-body text-ink-800">{label}</span>}
    </label>
  )
);
Switch.displayName = 'Switch';
