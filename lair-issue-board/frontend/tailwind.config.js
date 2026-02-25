/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lair: {
          bg: '#0f0f13',
          surface: '#1a1a24',
          card: '#22222e',
          border: '#2e2e3e',
          accent: '#6c5ce7',
          'accent-light': '#a29bfe',
          text: '#e4e4eb',
          muted: '#8888a0',
          success: '#00b894',
          warning: '#fdcb6e',
          danger: '#e17055',
          critical: '#d63031',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
