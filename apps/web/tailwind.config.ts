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
        sage: {
          50:  '#f2f8f4',
          100: '#e1f0e6',
          200: '#c3e2cd',
          300: '#96cca8',
          400: '#64af7f',
          500: '#40915f',
          600: '#2e7449',
          700: '#265d3c',
          800: '#204a31',
          900: '#1b3d29',
          950: '#0e2218',
        },
        cream: {
          50:  '#fdfcf8',
          100: '#f9f6ef',
          200: '#f2ede0',
        },
      },
      fontFamily: {
        arabic: ['Amiri', 'Scheherazade New', 'serif'],
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 16px 0 rgba(30,74,49,0.07)',
        card: '0 1px 3px 0 rgba(30,74,49,0.06), 0 4px 20px 0 rgba(30,74,49,0.05)',
        glow: '0 0 0 3px rgba(64,145,95,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
