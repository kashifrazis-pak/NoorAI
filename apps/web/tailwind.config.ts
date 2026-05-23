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
        green: {
          900: '#1A5C38',
          800: '#1e6b41',
          700: '#2E8648',
          600: '#369c54',
          100: '#D6EEDB',
          50: '#f0faf3',
        },
      },
      fontFamily: {
        arabic: ['Amiri', 'Scheherazade New', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
