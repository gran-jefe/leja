import React from 'react';
import { cn } from '@/lib/utils';

export type StepKind = 'connect' | 'agree' | 'protect';

/**
 * The three "how it works" illustrations, drawn as line art rather than
 * commissioned as 3D renders.
 *
 * The image brief originally specced these as isometric clay renders — which
 * is the Vercel/Raycast idiom, and one the design plan explicitly lists under
 * "avoided". This direction is hairlines, seals and engraved-certificate
 * precision, so a matte 3D blob would read as an import from another brand.
 *
 * Drawing them instead of generating them also means: they can't drift from
 * each other, they inherit the brass token, they scale to any size, and all
 * three together weigh less than a favicon.
 */

const SEAL_TICKS = 48;

/** The guilloche tick ring from the brand mark, reused as a common frame. */
function SealFrame() {
  return (
    <g className="text-brass-500">
      <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="0.75" opacity="0.35" />
      <circle cx="60" cy="60" r="49" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      {Array.from({ length: SEAL_TICKS }).map((_, i) => {
        const a = (i / SEAL_TICKS) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={60 + Math.cos(a) * 49}
            y1={60 + Math.sin(a) * 49}
            x2={60 + Math.cos(a) * 54}
            y2={60 + Math.sin(a) * 54}
            stroke="currentColor"
            strokeWidth="0.75"
            opacity="0.22"
          />
        );
      })}
    </g>
  );
}

const glyphs: Record<StepKind, React.ReactNode> = {
  // Two dwellings, joined directly — no third party between them.
  connect: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g className="text-navy-900" stroke="currentColor" strokeWidth="2.5">
        <path d="M30 62 L42 51 L54 62" />
        <path d="M34 62 V78 H50 V62" />
      </g>
      <g className="text-navy-900" stroke="currentColor" strokeWidth="2.5">
        <path d="M66 62 L78 51 L90 62" />
        <path d="M70 62 V78 H86 V62" />
      </g>
      {/* The link itself — the only brass element, because it's the point. */}
      <path
        d="M42 44 Q60 28 78 44"
        className="text-brass-500"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="0 0"
      />
      <circle cx="42" cy="44" r="3.5" className="text-brass-500" fill="currentColor" />
      <circle cx="78" cy="44" r="3.5" className="text-brass-500" fill="currentColor" />
    </g>
  ),

  // A document that has been agreed, not merely drafted.
  agree: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g className="text-navy-900" stroke="currentColor" strokeWidth="2.5">
        <path d="M40 32 H74 L82 40 V88 H40 Z" />
        <path d="M74 32 V40 H82" />
      </g>
      <g className="text-navy-900" stroke="currentColor" strokeWidth="2" opacity="0.4">
        <path d="M49 50 H67" />
        <path d="M49 58 H73" />
        <path d="M49 66 H61" />
      </g>
      {/* Signature rule + mark, brass. */}
      <path d="M49 78 H73" className="text-brass-500" stroke="currentColor" strokeWidth="2" opacity="0.55" />
      <path
        d="M51 73 q6 -7 11 -1 t9 -6"
        className="text-brass-500"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </g>
  ),

  // Cover placed over the dwelling, sealed at the base.
  protect: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M60 26 L88 37 V60 q0 22 -28 34 Q32 82 32 60 V37 Z"
        className="text-brass-500"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <g className="text-navy-900" stroke="currentColor" strokeWidth="2.5">
        <path d="M47 60 L60 49 L73 60" />
        <path d="M51 60 V74 H69 V60" />
        <path d="M60 74 V66" />
      </g>
    </g>
  ),
};

interface StepIllustrationProps {
  kind: StepKind;
  className?: string;
  size?: number;
}

export const StepIllustration: React.FC<StepIllustrationProps> = ({
  kind,
  className,
  size = 120,
}) => (
  <svg
    viewBox="0 0 120 120"
    width={size}
    height={size}
    className={cn('flex-shrink-0', className)}
    fill="none"
    aria-hidden
    focusable="false"
  >
    <SealFrame />
    {glyphs[kind]}
  </svg>
);
