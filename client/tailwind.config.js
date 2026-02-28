/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0eeff",
          100: "#e4e0ff",
          500: "#7c6af7",
          600: "#6a56f5",
          700: "#5540e8",
        },
        dark: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a26",
          600: "#22223a",
        },
      },
    },
  },
  plugins: [],
};
