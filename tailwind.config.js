/* eslint-disable import/no-anonymous-default-export */
/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        lora: ["Lora", "serif"],
      },
      fontWeight: {
        400: 400,
        700: 700,
        900: 900,
      },
      fontStyle: {
        italic: "italic",
      },
      colors: {
        "citrine-white": "#FCF8D6",
        espresso: "#5E2217",
      },
    },
  },
  plugins: [daisyui],
};