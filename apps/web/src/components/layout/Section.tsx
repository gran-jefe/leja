import React from 'react';
import { cn } from '@/lib/utils';
import { Container, type ContainerWidth } from './Container';

/**
 * Marketing section wrapper. Owns the vertical rhythm, the surface tone, and
 * the grain overlay that keeps dark bands from reading as flat fill — the
 * landing page previously alternated navy → cream → white with `py-24` on
 * every section and no texture anywhere.
 */
export type SectionTone = 'paper' | 'white' | 'dark' | 'darker' | 'accent';

const tones: Record<SectionTone, string> = {
  paper: 'bg-paper text-ink-700',
  white: 'bg-white text-ink-700',
  dark: 'bg-navy-900 text-on-dark bg-grain',
  darker: 'bg-navy-950 text-on-dark bg-grain',
  accent: 'bg-brass-50 text-ink-800',
};

const spacing = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-24',
  lg: 'py-24 sm:py-32',
};

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  size?: keyof typeof spacing;
  width?: ContainerWidth;
  /** Hairline rule along the top edge — the divider style this system uses. */
  divided?: boolean;
  containerClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  tone = 'paper',
  size = 'md',
  width = 'shell',
  divided,
  className,
  containerClassName,
  children,
  ...props
}) => {
  const dark = tone === 'dark' || tone === 'darker';

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        tones[tone],
        spacing[size],
        divided && (dark ? 'border-t border-white/10' : 'border-t border-ink-200'),
        className
      )}
      {...props}
    >
      <Container width={width} className={cn('relative', containerClassName)}>
        {children}
      </Container>
    </section>
  );
};

/** Small tracked mono label above a heading. */
export const Eyebrow: React.FC<{
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}> = ({ children, onDark, className }) => (
  <p
    className={cn(
      'font-mono text-label uppercase font-medium',
      onDark ? 'text-brass-300' : 'text-brass-700',
      className
    )}
  >
    {children}
  </p>
);
