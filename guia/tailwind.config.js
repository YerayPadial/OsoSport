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
        // Tus colores de nivel están perfectos.
        'nivel-1': '#2E7D32',
        'nivel-2': '#E65100',
        'nivel-3': '#C62828',
      },
      fontSize: {
        // Esto está perfecto como lo tienes.
        'base': '18px',
        'sm': '16px',
      },
      minHeight: {
        'touch-target': '60px', // ¡Genial para accesibilidad!
      },
      minWidth: {
        'touch-target': '60px',
      }
    },
  },
  plugins: [],
}