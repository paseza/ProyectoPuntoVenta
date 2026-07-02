/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        institucional: {
          azul: '#1d4ed8',
          azulOscuro: '#1e3a8a',
          gris: '#475569',
          grisClaro: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(30, 58, 138, 0.08), 0 1px 2px -1px rgba(30, 58, 138, 0.08)',
      },
    },
  },
  plugins: [],
};
