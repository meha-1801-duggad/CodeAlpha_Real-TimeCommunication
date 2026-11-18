/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pearl: {
          25: '#FDFEFE',
          50: '#F8FAFC',
          100: '#F1F5F9',
          150: '#E9EEF5',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'dock': '0 20px 45px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.95)',
        'tile': '0 10px 25px -6px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.85)',
        'card': '0 12px 30px -8px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(226, 232, 240, 0.9)',
        'speaking': '0 0 0 3px #2563EB, 0 12px 32px -4px rgba(37, 99, 235, 0.35)',
      },
      animation: {
        'float-reaction': 'floatUp 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.6)' },
          '15%': { opacity: '1', transform: 'translateY(0) scale(1.15)' },
          '80%': { opacity: '1', transform: 'translateY(-70px) scale(1.05)' },
          '100%': { opacity: '0', transform: 'translateY(-130px) scale(0.85)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
