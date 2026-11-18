/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#07080B',
          900: '#0A0C10',
          850: '#0F1117',
          800: '#14171F',
          750: '#1A1E29',
          700: '#222736',
          600: '#2F364B',
          500: '#434D6B',
          400: '#697495',
          300: '#9BA5C0',
          200: '#CBD2E3',
          100: '#EDF0F7',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          accent: '#38BDF8',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass-glow': '0 0 40px -10px rgba(99, 102, 241, 0.15)',
        'dock': '0 20px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'tile': '0 12px 30px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'speaking': '0 0 0 2px #6366F1, 0 0 30px rgba(99, 102, 241, 0.45)',
      },
      animation: {
        'float-reaction': 'floatUp 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-speaking': 'pulseSpeaking 2s infinite',
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
        pulseSpeaking: {
          '0%, 100%': { boxShadow: '0 0 0 2px #6366F1, 0 0 25px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 0 2px #818CF8, 0 0 40px rgba(129, 140, 248, 0.7)' },
        },
      },
    },
  },
  plugins: [],
}
