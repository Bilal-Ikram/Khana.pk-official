/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'agrandir': ['"PP Agrandir"', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'sans': ['"Open Sans"']
      }
    },
  },
  plugins: [],
}

