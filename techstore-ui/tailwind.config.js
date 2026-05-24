/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-white': '#FFFFFF',
        'apple-gray': '#F5F5F7',
        'apple-dark': '#1D1D1F',
        'apple-blue': '#0066CC',
        'apple-border': '#D2D2D7',
      },
      borderRadius: {
        'apple': '18px',
      },
      backdropBlur: {
        'apple': '20px',
      }
    },
  },
  plugins: [],
}