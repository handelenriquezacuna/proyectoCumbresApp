/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cumbres: {
          conceptos: '#3b82f6',     // azul
          metodos: '#8b5cf6',       // morado
          aplicaciones: '#ec4899',  // rosa
          caso: '#ef4444',          // rojo
          implementacion: '#10b981',// verde
          futuro: '#f97316',        // naranja
          conclusiones: '#eab308',  // amarillo
          plan: '#6366f1',           // índigo
          hoja: '#217346',           // verde Excel
        },
      },
    },
  },
  plugins: [],
};
