/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Mantenemos tus colores pero los aplanamos para que funcionen 
        // con las clases que ya usamos: bg-agro-midnight, text-agro-teal, etc.
        "agro-midnight": "#0A0F10", // El tono oscuro del render
        "agro-charcoal": "#1A1F20", // Slate 800 oscurecido para Noir
        "agro-teal": "#3F6F76",
        "agro-teal-light": "#5A8C93",
        "agro-teal-dark": "#2F5458",
        "agro-cream": "#E8E0C8", // El crema exacto del diseño
        "agro-white": "#FFFFFF",
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3.5rem',
      },
      boxShadow: {
        'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
        'teal-glow': '0 0 25px -5px rgba(63, 111, 118, 0.4)',
        'teal-glow-lg': '0 0 50px -10px rgba(63, 111, 118, 0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};