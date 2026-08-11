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
        className="object-cover object-right opacity-70"
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
    <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/35" />
    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy-950 to-transparent" />

    {/* Grain, last so it sits over everything. */}
    <div className="absolute inset-0 bg-grain" />
  </div>
);
