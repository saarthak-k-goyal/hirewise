/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f8f8f8',
          100: '#e8e8e8',
          200: '#d0d0d0',
          300: '#a8a8a8',
          400: '#707070',
          500: '#484848',
          600: '#303030',
          700: '#202020',
          800: '#141414',
          900: '#0a0a0a',
          950: '#050505',
        },
        brand: {
          50: '#eef8ff',
          100: '#d9eeff',
          200: '#bce3ff',
          300: '#8ed2ff',
          400: '#59b8fd',
          500: '#3399fa',
          600: '#1d7aef',
          700: '#1563dc',
          800: '#1750b2',
          900: '#19458c',
          950: '#142b55',
        },
        accent: {
          green: '#22c55e',
          red: '#ef4444',
          orange: '#f97316',
          yellow: '#eab308',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'score-fill': 'scoreFill 1.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}