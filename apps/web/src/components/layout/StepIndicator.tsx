import React from 'react';
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
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <React.Fragment key={i}>
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                i < currentStep
                  ? 'bg-forest text-white'
                  : i === currentStep - 1
                    ? 'bg-forest text-white'
                    : 'bg-border text-charcoal'
              )}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  'h-1 flex-1 transition-colors',
                  i < currentStep - 1 ? 'bg-forest' : 'bg-border'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-sm text-muted font-body">
        Step {currentStep} of {totalSteps}
        {labels && labels[currentStep - 1] ? ` — ${labels[currentStep - 1]}` : ''}
      </p>
    </div>
  );
};
