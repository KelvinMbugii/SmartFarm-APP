export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 🌿 Agriculture & Growth
        primary: {
          light: "#8BC34A",
          DEFAULT: "#4CAF50",
          dark: "#2E7D32",
        },

        // 🌾 Earth & Soil
        secondary: {
          light: "#E0C097",
          DEFAULT: "#8D6E63",
          dark: "#5D4037",
        },

        // 💧 Trust & Technology
        accent: {
          light: "#81D4FA",
          DEFAULT: "#2196F3",
          dark: "#1565C0",
        },

        // 🪶 Neutrals
        neutral: {
          light: "#F5F5F5",
          DEFAULT: "#CFD8DC",
          dark: "#212121",
        },

        // ✅ Semantic
        success: "#43A047",
        warning: "#FBC02D",
        error: "#E53935",
      },
    },
  },
};


