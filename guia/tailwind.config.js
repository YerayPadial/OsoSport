/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        // Colores de los niveles según la documentación (con corrección de accesibilidad)
        'nivel-1': '#2E7D32', 
        'nivel-2': '#E65100', 
        'nivel-3': '#C62828', 
      },
      fontSize: {
        // Definimos los tamaños de fuente base para accesibilidad
        'base': '18px',     
        'sm': '16px',       
      },
      minHeight: {
        // Zona táctil mínima de 60px para accesibilidad
        'touch-target': '60px',
      },
      minWidth: {
        'touch-target': '60px',
      }
    },
  },
  plugins: [],
}