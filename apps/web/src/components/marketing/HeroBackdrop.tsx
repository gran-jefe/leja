import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HeroBackdropProps {
  /**
   * Drop the hero photograph in here when it exists (see the image prompts in
   * the design plan — `hero-lagos-residence.jpg`, needs its left third clear).
   * Until then the geometric treatment below stands on its own, so the hero is
   * finished either way rather than obviously waiting for an asset.
   */
  src?: string;
  alt?: string;
  className?: string;
}

export const HeroBackdrop: React.FC<HeroBackdropProps> = ({ src, alt = '', className }) => (
  <div className={cn('absolute inset-0 overflow-hidden bg-navy-950', className)} aria-hidden={!src}>
    {src && (
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        // Full opacity. Legibility is the scrim's job — dimming the photograph
        // as well meant only ~45% of it survived at the right edge, which made
        // the shot effectively invisible.
        className="object-cover object-right"
      />
    )}

    {/* Seal geometry — the brand mark's concentric rings, blown up and bled off
        the right edge. Reads as architecture at a glance, stamp on a second
        look. */}
    <svg
      className="absolute -right-[18%] top-1/2 -translate-y-1/2 h-[150%] w-auto text-brass-500 hidden sm:block"
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden
    >
      <circle cx="300" cy="300" r="290" stroke="currentColor" strokeWidth="1" opacity="0.14" />
      <circle cx="300" cy="300" r="235" stroke="currentColor" strokeWidth="1" opacity="0.10" />
      <circle cx="300" cy="300" r="180" stroke="currentColor" strokeWidth="1.5" opacity="0.16" />
      <circle cx="300" cy="300" r="120" stroke="currentColor" strokeWidth="1" opacity="0.08" />
      {/* Guilloche ticks — the fine radial detail on a banknote or a seal. */}
      {Array.from({ length: 72 }).map((_, i) => {
        const a = (i / 72) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={300 + Math.cos(a) * 180}
            y1={300 + Math.sin(a) * 180}
            x2={300 + Math.cos(a) * 192}
            y2={300 + Math.sin(a) * 192}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.18"
          />
        );
      })}
    </svg>

    {/* Warm key light from the upper right — the "afternoon" of the direction. */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(70% 55% at 78% 28%, rgba(184,134,43,0.20) 0%, rgba(184,134,43,0.05) 42%, transparent 72%)',
      }}
    />

    {/* Legibility scrim. Keeps the left third readable whether the slot holds a
        photograph or the geometry. */}
    {/* Weighted to the left, where the headline sits, and cleared on the right
        so the photograph is actually visible. The old ramp bottomed out at
        /35 across the whole right side and buried the shot. */}
    <div className="absolute inset-0 bg-gradient-to-r from-navy-950 from-20% via-navy-950/75 via-55% to-navy-950/10" />
    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy-950 to-transparent" />

    {/* Grain, last so it sits over everything. */}
    <div className="absolute inset-0 grain-overlay" />
  </div>
);
