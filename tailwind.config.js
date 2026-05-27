/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  "#f0f4f9",
          100: "#dce6f1",
          600: "#2c5282",
          700: "#1a3a5c",
          800: "#1e3a5f",
          900: "#0f2237",
        },
      },
    },
  },
  plugins: [],
};
