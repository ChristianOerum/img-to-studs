/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    zIndex: {
      auto: "auto",
      0: 0,
      10: 10,
      20: 20,
      30: 30,
      40: 40,
      50: 50,
      60: 60,
      70: 70,
      80: 80,
      90: 90,
      100: 100,
      110: 110,
    },
    screens: {
      mobile: "480px",
      // => @media (min-width:  480px) { ... }

      tablet: "768px",
      // => @media (min-width: 768px) { ... }

      desktop: "1024px",
      // => @media (min-width: 1024px) { ... }
    },
    extend: {
      colors: {
        bubbles: "#0097ff",
        main: "#00214B",
      },
      fontFamily: {
        bold: ["axiforma-bold"],
        black: ["axiforma-black"],
        medium: ["axiforma-medium"],
        semibold: ["axiforma-semibold"],
        regular: ["axiforma-regular"],
      },
      fontWeight: {
        '400': 400, // Regular
        '500': 500, // Medium
        '600': 600, // Semibold
        '700': 700, // Bold
        '900': 900, // Black
      },
    },
  },
  plugins: [],
};
