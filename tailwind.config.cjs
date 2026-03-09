/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mbtaPurple: {
          DEFAULT: '#6B21A8',
          light: '#A855F7',
          dark: '#4C1D95'
        }
      }
    }
  },
  plugins: []
};
