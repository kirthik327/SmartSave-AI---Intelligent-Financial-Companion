/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: '#10b981',
          emeraldDark: '#047857',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          gold: '#eab308',
          bgDark: '#09090b',
          cardDark: '#0c0c0f',
          borderDark: '#1e1e24'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.25)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.25)'
      }
    },
  },
  plugins: [],
}
