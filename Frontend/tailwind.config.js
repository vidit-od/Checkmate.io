/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./packages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage:{
        'ChessBoard': "url('/src/assets/ChessBoard.png')",
        'WRook': "url('/src/assets/WhiteRook.png')"
      },
      fontSize:{
        'xs' : "0.6rem"
      }
    },
  },
  plugins: [],
}