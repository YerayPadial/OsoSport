import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'Lato', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'nivel-1': '#22C55E',
        'nivel-1Fem': '#9756e8',
        'nivel-2': '#F59E0B',
        'nivel-3': '#DC2626',
        'fondo-oscuro': '#1F2937', 
      },
      fontSize: {
        'base': '18px',
        'sm': '16px',
      },
      minHeight: {
        'touch-target': '60px',
      },
      minWidth: {
        'touch-target': '60px',
      }
    },
  },
  plugins: [],
}