/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        one: ["var(--font-one)", "sans-serif"],
        two: ["var(--font-two)", "sans-serif"],
        three: ["var(--font-three)", "sans-serif"],
      },
      colors: {
        tertiary: {
          400: "#ff9d00",
          500: "#ff5500",
          600: "#e64a00",
        },
        noir: {
          500: "#1a1a1a",
          600: "#161616",
          700: "#131313",
          800: "#0f0f0f",
        },
      },
    },
  },
  plugins: [],
};
