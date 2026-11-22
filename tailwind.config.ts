import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './vite-shims/**/*.{js,ts,jsx,tsx}',
    './main.vite.tsx',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd6ff',
          300: '#8ebaff',
          400: '#5893f7',
          500: '#326fe8',
          600: '#1f54cf',
          700: '#1a41a6',
          800: '#193883',
          900: '#0f2a4a',
          950: '#0a1c33',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f5b301',
          600: '#d99a00',
          700: '#b45309',
        },
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(15, 42, 74, 0.18)',
        card: '0 2px 8px rgba(15, 42, 74, 0.06)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '70%': { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'check-draw': {
          from: { 'stroke-dashoffset': '48' },
          to: { 'stroke-dashoffset': '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'slide-up': 'slide-up 0.45s cubic-bezier(0.22,1,0.36,1) both',
        pop: 'pop 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
        'check-draw': 'check-draw 0.5s 0.15s ease-out both',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
