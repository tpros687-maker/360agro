/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        headline: ['Manrope'],
        body: ['Manrope'],
        label: ['Manrope'],
      },
      colors: {
        "background": "#F8FAF8",
        "surface": "#FFFFFF",
        "surface-dim": "#F0F4F2",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F4F8F6",
        "surface-container": "#EDF2EF",
        "surface-container-high": "#E5EDE8",
        "surface-container-highest": "#D8E5DC",
        "on-surface": "#1A2E28",
        "on-surface-variant": "#4A6B5E",
        "on-background": "#1A2E28",
        "primary": "#235347",
        "secondary": "#96786F",
        "on-primary": "#FFFFFF",
        "on-secondary": "#FFFFFF",
        "outline": "#C8D8D2",
        "outline-variant": "#C8D8D2",
        "surface-variant": "#EDF2EF",
        "primary-container": "#8CB79B",
        "on-primary-container": "#FFFFFF",
        "secondary-container": "#EDF2EF",
        "on-secondary-container": "#1A2E28",

        // Status
        "error": "#BA1A1A",
        "on-error": "#FFFFFF",
        "success": "#2E7D32",

        // Legacy compatibility
        "agro-primary": "#235347",
        "agro-secondary": "#96786F",
        "agro-accent": "#8CB79B",
        "agro-navy": "#235347",
        "agro-midnight": "#F8FAF8",
        "agro-charcoal": "#EDF2EF",
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3.5rem',
      },
      boxShadow: {
        'premium': '0 12px 32px -4px rgba(35, 83, 71, 0.08)',
        'soft': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 25px -5px rgba(35, 83, 71, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};