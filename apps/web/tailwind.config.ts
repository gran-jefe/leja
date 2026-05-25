import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0D1B2A',
        forest: '#1A7A4A',
        ember: '#C4522A',
        cream: '#F7F9FC',
        charcoal: '#2D3748',
        muted: '#718096',
        border: '#E2E8F0',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
      },
    },
  },
  plugins: [],
};
export default config;
