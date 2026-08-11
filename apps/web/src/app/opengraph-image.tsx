import { ImageResponse } from 'next/og';
import { loadDisplayFont } from '@/lib/og-font';

/**
 * Open Graph card, generated at build time rather than shipped as a binary.
 *
 * Replaces the `/og.jpg` the metadata used to point at, which never existed —
 * every share was hitting a 404. Generating it means the card can't drift from
 * the brand, and there's no image to re-export when the wordmark changes.
 *
 * Colours are literal hex here on purpose: Satori doesn't evaluate CSS custom
 * properties, so the design tokens in globals.css aren't reachable. Keep these
 * in sync with `--navy-950`, `--brass-500`, `--brass-300` and `--ink-300`.
 */
export const alt = 'BeyondAgency — Nigeria\'s trust platform for direct deals';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY = '#060C12';
const NAVY_900 = '#0B1620';
const BRASS = '#B8862B';
const BRASS_300 = '#DCBE78';
const INK_300 = '#B0A697';
const PAPER = '#FAF6EE';

const HEADLINE = 'Deal directly. Without the risk.';
const EYEBROW = "NIGERIA'S TRUST PLATFORM";
const TAGLINE = 'Bridging Trust. Simplifying Deals.';

export default async function Image() {
  const fraunces = await loadDisplayFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: NAVY,
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        {/* Warm key light from the upper right — the "afternoon" of the
            direction, and the only thing stopping this reading as flat fill. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(60% 60% at 78% 26%, rgba(184,134,43,0.22) 0%, rgba(184,134,43,0.05) 45%, transparent 72%)`,
          }}
        />

        {/* Brass seal geometry, bled off the right edge. Concentric divs rather
            than SVG — Satori's border-radius is reliable, its SVG support is not. */}
        {[560, 440, 320, 200].map((d, i) => (
          <div
            key={d}
            style={{
              position: 'absolute',
              right: -170,
              top: 315 - d / 2,
              width: d,
              height: d,
              borderRadius: d / 2,
              border: `1px solid ${BRASS}`,
              opacity: [0.16, 0.12, 0.2, 0.1][i],
            }}
          />
        ))}

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: NAVY_900,
              border: `1.5px solid ${BRASS}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                border: `2px solid ${BRASS_300}`,
              }}
            />
          </div>
          <div
            style={{
              // Satori requires explicit display on any node with more than
              // one child — "Beyond" + <span> counts as two.
              display: 'flex',
              fontFamily: 'Fraunces',
              fontSize: 30,
              fontWeight: 600,
              color: PAPER,
              letterSpacing: '-0.01em',
            }}
          >
            <span>Beyond</span>
            <span style={{ color: BRASS_300 }}>Agency</span>
          </div>
        </div>

        {/* Headline block */}
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 780 }}>
          <div
            style={{
              fontSize: 19,
              letterSpacing: '0.14em',
              color: BRASS_300,
              marginBottom: 22,
            }}
          >
            {EYEBROW}
          </div>
          <div
            style={{
              fontFamily: 'Fraunces',
              fontSize: 74,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: '-0.025em',
              color: PAPER,
            }}
          >
            {HEADLINE}
          </div>
        </div>

        {/* Footer rule + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              height: 1,
              width: '100%',
              background: `rgba(184,134,43,0.35)`,
              marginBottom: 22,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ fontSize: 24, color: INK_300 }}>{TAGLINE}</div>
            {/* Deliberately not "₦0" — the Naira sign is outside the vendored
                latin subset and makes Satori attempt a dynamic font download. */}
            <div style={{ fontSize: 24, color: BRASS_300, letterSpacing: '0.04em' }}>
              Free to agree
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // Satori requires at least one font — an empty array throws
      // "No fonts are loaded", which is why this must not be conditional.
      fonts: [{ name: 'Fraunces', data: fraunces, style: 'normal', weight: 600 }],
    }
  );
}
