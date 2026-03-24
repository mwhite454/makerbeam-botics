/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1a2e',
          100: '#16213e',
          200: '#0f3460',
        },
        accent: '#e94560',
      },
    },
  },
  plugins: [],
}
