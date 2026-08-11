import type { Config } from 'tailwindcss';

/**
 * "Warm Institution" — Navy + Brass.
 *
 * Colour values live as RGB channels in globals.css so opacity modifiers
 * (`bg-navy-900/80`) keep working. Never add a raw hex here or in a component.
 *
 * Legacy aliases (navy, forest, ember, cream, charcoal, muted, border) map onto
 * the new scale so existing markup keeps compiling while it is migrated.
 */
const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: rgb('--navy-950'),
          900: rgb('--navy-900'),
          800: rgb('--navy-800'),
          700: rgb('--navy-700'),
          600: rgb('--navy-600'),
          DEFAULT: rgb('--navy-900'),
        },
        brass: {
          50: rgb('--brass-50'),
          100: rgb('--brass-100'),
          300: rgb('--brass-300'),
          500: rgb('--brass-500'),
          600: rgb('--brass-600'),
          700: rgb('--brass-700'),
          DEFAULT: rgb('--brass-500'),
        },

        // Semantic states. `forest` and `ember` remain addressable by their old
        // names, but they are status colours now — not brand colours.
        success: {
          50: rgb('--forest-50'),
          100: rgb('--forest-100'),
          500: rgb('--forest-500'),
          600: rgb('--forest-600'),
          700: rgb('--forest-700'),
          DEFAULT: rgb('--forest-500'),
        },
        warning: {
          50: rgb('--ember-50'),
          100: rgb('--ember-100'),
          500: rgb('--ember-500'),
          600: rgb('--ember-600'),
          700: rgb('--ember-700'),
          DEFAULT: rgb('--ember-500'),
        },
        danger: {
          50: rgb('--crimson-50'),
          100: rgb('--crimson-100'),
          500: rgb('--crimson-500'),
          600: rgb('--crimson-600'),
          700: rgb('--crimson-700'),
          DEFAULT: rgb('--crimson-600'),
        },
        info: rgb('--navy-600'),

        ink: {
          950: rgb('--ink-950'),
          900: rgb('--ink-900'),
          800: rgb('--ink-800'),
          700: rgb('--ink-700'),
          600: rgb('--ink-600'),
          500: rgb('--ink-500'),
          400: rgb('--ink-400'),
          300: rgb('--ink-300'),
          200: rgb('--ink-200'),
          100: rgb('--ink-100'),
          50: rgb('--ink-50'),
        },
        paper: rgb('--paper'),

        'on-dark': {
          DEFAULT: rgb('--on-dark'),
          muted: rgb('--ink-300'),
        },

        // ---- Legacy aliases — migrate call sites, then delete ----
        forest: rgb('--forest-500'),
        ember: rgb('--ember-500'),
        cream: rgb('--paper'),
        charcoal: rgb('--ink-700'),
        muted: rgb('--ink-500'),
        border: rgb('--ink-200'),
      },

      fontFamily: {
        display: ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'DM Mono', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        // Fluid display scale. Tracking tightens as size grows — Fraunces
        // needs negative tracking above ~32px or it reads loose.
        'display-xl': ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-sm': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'title': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.65' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },

      borderRadius: {
        sm: '6px',
        button: '8px',
        card: '12px',
        xl: '16px',
        '2xl': '24px',
        chat: '16px 16px 16px 4px',
        'chat-mine': '16px 16px 4px 16px',
      },

      boxShadow: {
        xs: '0 1px 2px rgba(33,28,22,.06)',
        sm: '0 1px 3px rgba(33,28,22,.08), 0 1px 2px rgba(33,28,22,.04)',
        md: '0 4px 12px rgba(33,28,22,.08)',
        lg: '0 12px 32px rgba(33,28,22,.10)',
        xl: '0 24px 64px rgba(33,28,22,.14)',
        ring: 'inset 0 0 0 1px rgba(33,28,22,.06)',
        brass: '0 2px 12px rgba(184,134,43,.22)',
      },

      transitionDuration: {
        fast: '150ms',
        base: '220ms',
        slow: '320ms',
        deliberate: '480ms',
      },

      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      maxWidth: {
        // One width scale. Replaces the 8 ad-hoc max-w-* values in use today.
        prose: '65ch',
        form: '32rem',
        content: '48rem',
        wide: '64rem',
        shell: '80rem',
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
