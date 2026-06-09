/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      colors: {
        medical: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b8dcff',
          300: '#7ec0ff',
          400: '#3ba0ff',
          500: '#0a80ff',
          600: '#0061d4',
          700: '#004ca3',
          800: '#00408a',
          900: '#063670',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
