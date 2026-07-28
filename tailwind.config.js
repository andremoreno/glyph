/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070b12',
          900: '#0b1220',
          850: '#0f1626',
          800: '#131c30',
          700: '#1b2540',
          600: '#283353',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flashIn: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.99)' },
          '60%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out both',
        flashIn: 'flashIn 0.35s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
        glow: 'glow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
