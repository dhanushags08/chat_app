/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  darkMode: "class", // Enable dark mode manually
  plugins: [require("daisyui")], // Correct way to use daisyUI
  daisyui: {
    themes: ["light", "dark"], // Enable both light and dark themes
  },
};
