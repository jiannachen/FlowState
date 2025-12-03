/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        morandi: {
          bg: '#F5F5F0',       // Warm off-white
          surface: '#EBEBE6',  // Stone light
          primary: '#78716C',  // Stone 500
          accent: '#A8A29E',   // Stone 400
          text: '#44403C',     // Stone 700
          muted: '#78716C',    // Stone 500
          blue: '#94A3B8',     // Slate 400 (calm blue)
          green: '#84CC16',    // Lime 500 (muted)
          sage: '#CCD5AE',
          clay: '#E3D5CA'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
