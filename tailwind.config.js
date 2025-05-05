/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./src/**/*.{html,js}",
    "./*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C4DFF',
        secondary: '#FF80AB',
        accent: '#B388FF',
        'primary-light': '#E8E0FF',
        'primary-dark': '#5C35CC'
      }
    },
  },
  plugins: [],
} 