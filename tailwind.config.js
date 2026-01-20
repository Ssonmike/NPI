/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'mobile-l': '481px',
        'tablet': '769px',
        'desktop': '1025px',
      },
    },
  },
  plugins: [],
}
