export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.08)",
        soft: "0 2px 6px rgba(0, 0, 0, 0.05)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "Arial", "system-ui"],
      },
    },
  },
};
