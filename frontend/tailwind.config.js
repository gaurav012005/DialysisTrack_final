/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0891b2',
          600: '#0e7490',
          700: '#155e75',
          800: '#164e63',
          900: '#083344',
        },
        hospital: {
          cyan: {
            light: '#06b6d4',
            DEFAULT: '#0891b2',
            dark: '#0e7490',
          },
          green: {
            light: '#10b981',
            DEFAULT: '#059669',
            dark: '#047857',
          },
          indigo: {
            light: '#818cf8',
            DEFAULT: '#6366f1',
            dark: '#4f46e5',
          },
        },
        medical: {
          light: '#f0f9ff',
          white: '#ffffff',
          gray: '#f1f5f9',
          dark: '#0f172a',
          text: '#334155',
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
          blue: '#0891b2',
        }
      },
      boxShadow: {
        '3d-sm': '0 2px 4px rgba(8, 145, 178, 0.1), 0 4px 8px rgba(8, 145, 178, 0.05)',
        '3d-md': '0 4px 6px rgba(8, 145, 178, 0.1), 0 8px 16px rgba(8, 145, 178, 0.08)',
        '3d-lg': '0 10px 20px rgba(8, 145, 178, 0.15), 0 20px 40px rgba(8, 145, 178, 0.1)',
        '3d-xl': '0 20px 40px rgba(8, 145, 178, 0.2), 0 30px 60px rgba(8, 145, 178, 0.15)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-medical': 'pulse-medical 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'slideDown': 'slideDown 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'ripple': 'ripple 600ms linear',
        'fadeIn': 'fadeIn 200ms ease-out',
        'scaleIn': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-medical': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}