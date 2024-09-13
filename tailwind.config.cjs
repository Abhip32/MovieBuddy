/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', " sans-serif"]
      },
      colors: {
        "deep-purple":"#451488",
        "dark-purple": "#B300FF",
        "light-gray": "#bbbbbb",
        "black-2": '#111',
        "blue-gray": "#212529",
        "blue-gray-2": "#2c3237"
      },
      screens: {
        "xs": "460px"
      },
      aspectRatio: {
        "2/3": "2/3"
      }
    },
  },
  plugins: [],
}