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
        sans: ['Hanken Grotesk', 'Inter', ...defaultTheme.fontFamily.sans],
        numeric: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
 // --- COLORES OSCUROS ---
        'nivel-0-oscuro': 'var(--color-nivel-0-oscuro, #9CA3AF)',
        'nivel-1-oscuro': 'var(--color-nivel-1-oscuro, #02B04C)',
        'nivel-1Fem-oscuro': 'var(--color-nivel-1Fem-oscuro, #D80458)',
        'nivel-2-oscuro': 'var(--color-nivel-2-oscuro, #D35400)',
        'nivel-3-oscuro': 'var(--color-nivel-3-oscuro, #C0392B)',
        
        'fondo-oscuro': 'var(--color-fondo-oscuro, #11131B)',
        'tarjeta-oscura': 'var(--color-tarjeta-oscura, #1D1F28)',
        'texto-oscuro': 'var(--color-texto-oscuro, #E2E1ED)',
        'texto-secundario-oscuro': 'var(--color-texto-secundario-oscuro, #C3C5D7)',
        'borde-oscuro': 'var(--color-borde-oscuro, #434655)',
        
        'dieta-ganar-oscuro': 'var(--color-dieta-ganar-oscuro, #2D62ED)',
        'dieta-perder-oscuro': 'var(--color-dieta-perder-oscuro, #D80458)',

        // --- COLORES CLAROS ---
        'nivel-0-claro': 'var(--color-nivel-0-claro, #8D90A1)',
        'nivel-1-claro': 'var(--color-nivel-1-claro, #02B04C)',
        'nivel-1Fem-claro': 'var(--color-nivel-1Fem-claro, #D80458)',
        'nivel-2-claro': 'var(--color-nivel-2-claro, #D35400)',
        'nivel-3-claro': 'var(--color-nivel-3-claro, #C0392B)',

        'fondo-claro': 'var(--color-fondo-oscuro, #11131B)',
        'tarjeta-clara': 'var(--color-tarjeta-oscura, #1D1F28)',
        'texto-claro': 'var(--color-texto-oscuro, #E2E1ED)',
        'texto-secundario-claro': 'var(--color-texto-secundario-oscuro, #C3C5D7)',
        'borde-claro': 'var(--color-borde-oscuro, #434655)',

        'dieta-ganar-claro': 'var(--color-dieta-ganar-claro, #2D62ED)',
        'dieta-perder-claro': 'var(--color-dieta-perder-claro, #D80458)',

        'surface': 'var(--color-fondo-oscuro, #11131B)',
        'surface-low': 'var(--color-surface-low, #191B23)',
        'surface-card': 'var(--color-surface-card, #1D1F28)',
        'surface-card-high': 'var(--color-surface-card-high, #282A32)',
        'surface-bright': 'var(--color-surface-bright, #373942)',
        'surface-variant': 'var(--color-surface-variant, #33343D)',
        'on-surface': 'var(--color-texto-oscuro, #E2E1ED)',
        'on-surface-muted': 'var(--color-texto-secundario-oscuro, #C3C5D7)',
        'outline-vanguard': 'var(--color-borde-oscuro, #434655)',
        'primary-vanguard': 'var(--color-primary-vanguard, #2D62ED)',
        'primary-soft': 'var(--color-primary-soft, #B5C4FF)',
        'success-vanguard': 'var(--color-success-vanguard, #02B04C)',
        'success-soft': 'var(--color-success-soft, #53E076)',
      },
      fontSize: {
        'base': '16px',
        'sm': '14px',
      },
      minHeight: {
        'touch-target': '48px',
      },
      minWidth: {
        'touch-target': '48px',
      }
    },
  },
  plugins: [],
}
