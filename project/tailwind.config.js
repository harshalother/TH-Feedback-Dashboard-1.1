/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Tim Hortons Brand Red - Used for primary actions and brand elements
        primary: '#C8102E',
        // Dark Coffee - Used for text and secondary elements
        secondary: '#4B3228',
        // Light Cream/Warm Beige - Used for backgrounds and surfaces
        surface: '#F9F5F0',
      },
    },
  },
  plugins: [],
}
