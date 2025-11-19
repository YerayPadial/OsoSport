import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
 // --- COLORES OSCUROS ---
        'nivel-1-oscuro': '#22C55E',
        'nivel-1Fem-oscuro': '#9756e8',
        'nivel-2-oscuro': '#F59E0B',
        'nivel-3-oscuro': '#DC2626',
        
        'fondo-oscuro': '#1F2937',      
        'tarjeta-oscura': '#374151',    
        'texto-oscuro': '#F3F4F6',      
        'texto-secundario-oscuro': '#D1D5DB', 
        'borde-oscuro': '#374151',  
        
        'dieta-ganar-oscuro': '#14B8A6', 
        'dieta-perder-oscuro': '#8B5CF6', 

        // --- COLORES CLAROS ---
        'nivel-1-claro': '#166534',     
        'nivel-1Fem-claro': '#6b21a8',   
        'nivel-2-claro': '#B45309',     
        'nivel-3-claro': '#B91C1C',     

        'fondo-claro': '#F9FAFB',       
        'tarjeta-clara': '#FFFFFF',      
        'texto-claro': '#1F2937',       
        'texto-secundario-claro': '#4B5563', 
        'borde-claro': '#E5E7EB',

        'dieta-ganar-claro': '#0D9488',
        'dieta-perder-claro': '#6D28D9',
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