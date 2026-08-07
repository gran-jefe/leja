import { BEYOND_PRICING } from '../constants/pricing';

// Clamps a landlord-proposed legalization fee rate to the platform's allowed
// negotiation band, defaulting to the standard rate when none is given.
export function clampLegalizationRate(rate?: number): number {
  const proposed = rate ?? BEYOND_PRICING.LEGALIZATION_FEE_RATE;
  return Math.min(
    Math.max(proposed, BEYOND_PRICING.LEGALIZATION_FEE_MIN_RATE),
    BEYOND_PRICING.LEGALIZATION_FEE_MAX_RATE
  );
}

// Pure fee calculation — percentage of annual rent, clamped to the
// negotiation band, then floored and capped in Naira. Both API and web must
// go through this rather than computing the percentage/floor/cap inline, so
// the rule only ever lives in one place.
export function calculateLegalizationFee(annualRentNaira: number, rate?: number): number {
  const effectiveRate = clampLegalizationRate(rate);
  const raw = annualRentNaira * effectiveRate;
  const bounded = Math.min(
    Math.max(raw, BEYOND_PRICING.LEGALIZATION_FEE_FLOOR),
    BEYOND_PRICING.LEGALIZATION_FEE_CAP
  );
  return Math.round(bounded * 100) / 100;
}
