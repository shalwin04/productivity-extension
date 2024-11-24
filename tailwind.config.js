/* eslint-disable import/no-anonymous-default-export */
/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        lora: ["Lora", "serif"],
        poppins : ["Poppins","sans-serif"]
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
        background: "#DED4D4",
        name: " #415111",
        "vintage-teal": "#699699",
        title: "#7D681E",
      },
    },
  },
  plugins: [daisyui],
};