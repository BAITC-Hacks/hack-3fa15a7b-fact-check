module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F5EF",
        ink: "#272C26",
        muted: "#74786F",
        brand: "#C74F2D",
        accent: "#EB714C",
        line: "#E5E6DC",
        soft: "#FBECE5",
        sage: "#EAF0E3",
        green: "#456345",
      },
    },
  },
  plugins: [],
};
