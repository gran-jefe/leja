'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { LogoMark } from '@/components/brand/Logo';
import { Badge } from '@/components/ui/Badge';
import { formatNaira } from '@/lib/utils';

/**
 * The hero's one concrete object: a tenancy agreement rendered as a physical
 * document with a brass seal. Previously a flat white card with an
 * `animate-pulse` ring and a rotated watermark, hidden below `md` — so the
 * mobile hero had no visual at all.
 */
export function AgreementArtifact() {
  const reduced = useReducedMotion();

  return (
    <div className="relative mx-auto max-w-sm lg:max-w-none">
      {/* Stacked sheets behind, so it reads as paper rather than a UI card. */}
      <div
        aria-hidden
        className="absolute -bottom-2.5 left-3 right-3 h-full rounded-card bg-white/10 border border-white/10"
      />
      <div
        aria-hidden
        className="absolute -bottom-1.5 left-1.5 right-1.5 h-full rounded-card bg-white/20 border border-white/10"
      />

      <motion.div
        initial={reduced ? false : { rotate: -0.6 }}
        animate={reduced ? undefined : { rotate: [-0.6, 0.4, -0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="relative bg-paper rounded-card shadow-xl p-6 overflow-hidden"
      >
        {/* Brass seal, embossed into the corner. */}
        <div aria-hidden className="absolute -top-6 -right-6 opacity-[0.07]">
          <LogoMark size={140} className="text-navy-900" />
        </div>

        <div className="relative flex items-start justify-between mb-5">
          <div>
            <p className="font-mono text-label uppercase text-ink-400 mb-1">Tenancy agreement</p>
            <p className="font-mono text-body-sm text-ink-500">BA-2026-0418</p>
          </div>
          <Badge tone="success" dot size="sm">
            Active
          </Badge>
        </div>

        <dl className="relative space-y-2.5 font-body text-body-sm mb-5">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Landlord</dt>
            <dd className="text-ink-800 font-medium">Adebayo Okafor</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Tenant</dt>
            <dd className="text-ink-800 font-medium">Chioma Ezeh</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Property</dt>
            <dd className="text-ink-800 font-medium text-right">3 Bed, Lekki Phase 1</dd>
          </div>
        </dl>

        <div className="relative border-t border-ink-200 pt-4 mb-5">
          <p className="font-mono text-label uppercase text-ink-400 mb-1">Annual rent</p>
          <p className="font-mono tabular-nums text-display-sm font-medium text-navy-900">
            {formatNaira(2400000)}
          </p>
        </div>

        <ul className="relative space-y-2 font-body text-body-sm text-ink-600">
          {['Identities verified', 'Agreement on record', 'No agent fee paid'].map((line) => (
            <li key={line} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-brass-500 flex items-center justify-center flex-shrink-0">
                <Check size={10} strokeWidth={3.5} className="text-ink-950" aria-hidden />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
