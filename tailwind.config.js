const { colors } = require(`tailwindcss/defaultTheme`)
const { fontFamily } = require("tailwindcss/defaultTheme")
/** @type {import('tailwindcss').Config} \*/

module.exports = {
  mode: "jit", // see https://tailwindcss.com/docs/just-in-time-mode
  purge: ["./components/**/*.js", "./pages/**/*.js"],
  darkMode: false, // or "media" or "class"
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2d9664",
        secondary: "#004aad",
        dark: "#1F292E",
        darkgray: "#415058",
        midgray: "#58585F",
        lightgray: "#F2F2F3",
        inputgray: "#ccced1",
        warning: "#FFAB1A",
        danger: "#D4111B",
        success: "#73C322",
        info: "#6494fd",
        youtube: "#FF0000",
        point: "rgb(255,255,84)",
        up: "#1A661E",
        down: "#B30000",
        nochange: "#6c6a68",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          md: "2rem",
        },
      },
      textIndent: {
        4: "1rem",
      },
      fontFamily: {
        sans: ["var(--font-dosis)"],
      },
    },
    fontSize: {
      xs: "14px",
      sm: "17px",
      base: "21px",
      lg: "26px",
      xl: "32px",
      xxl: "45px",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1194px",
    },
    aspectRatio: {
      auto: "auto",
      square: "1 / 1",
      video: "16 / 9",
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "11",
      12: "12",
      13: "13",
      14: "14",
      15: "15",
      16: "16",
    },
  },
  variants: {
    extend: {},
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
}
