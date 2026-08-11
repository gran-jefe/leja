import { ImageResponse } from 'next/og';

/**
 * 180×180 touch icon, generated rather than shipped as a PNG.
 *
 * The metadata used to point at `/apple-touch-icon.png`, which never existed.
 *
 * The geometry is the same seal-and-doorway mark as `icon.svg` and
 * `components/brand/Logo`, drawn with real SVG paths. An earlier attempt built
 * it from rotated divs with partial borders — Satori rendered that, but the
 * result read as an arrow rather than a roof.
 *
 * Literal hex: Satori can't evaluate CSS custom properties. Mirrors
 * `--navy-900`, `--brass-500` and `--brass-300`.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B1620',
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="23" stroke="#B8862B" strokeWidth="1.5" opacity="0.55" />
          <circle cx="32" cy="32" r="19" stroke="#B8862B" strokeWidth="1" opacity="0.35" />
          <path
            d="M20 33.5 L32 22.5 L44 33.5"
            stroke="#DCBE78"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24.5 33.5 V43 H39.5 V33.5"
            stroke="#B8862B"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M32 43 V36.5" stroke="#DCBE78" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size
  );
}
