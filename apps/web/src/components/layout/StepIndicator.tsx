import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  labels,
}) => (
  <div className="mb-8">
    <ol className="flex items-center gap-2 mb-3">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNumber = i + 1;
        const complete = stepNumber < currentStep;
        const current = stepNumber === currentStep;

        return (
          <React.Fragment key={i}>
            <li
              aria-current={current ? 'step' : undefined}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-body font-semibold text-body-sm transition-colors duration-base',
                // Completed and current were previously identical (both
                // bg-forest), so there was no way to tell where you were.
                complete && 'bg-brass-500 text-ink-950',
                current && 'bg-navy-900 text-on-dark ring-2 ring-brass-500 ring-offset-2 ring-offset-paper',
                !complete && !current && 'bg-ink-100 text-ink-500'
              )}
            >
              {complete ? <Check size={16} strokeWidth={3} aria-hidden /> : stepNumber}
              <span className="sr-only">
                {labels?.[i] ?? `Step ${stepNumber}`}
                {complete ? ' (completed)' : ''}
              </span>
            </li>
            {i < totalSteps - 1 && (
              <li
                aria-hidden
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors duration-base',
                  complete ? 'bg-brass-500' : 'bg-ink-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
    <p className="font-mono text-label uppercase text-ink-500">
      Step {currentStep} of {totalSteps}
      {labels && labels[currentStep - 1] ? ` — ${labels[currentStep - 1]}` : ''}
    </p>
  </div>
);
