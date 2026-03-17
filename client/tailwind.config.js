export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "1rem",
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.1)",
        soft: "0 2px 6px rgba(0, 0, 0, 0.05)",
        hover: "0 8px 20px rgba(0, 0, 0, 0.15)",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "Arial", "system-ui"],
        body: ["Merriweather", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#00FF00",
          foreground: "#000000",
          light: "#7FFF00",
        },
        secondary: {
          DEFAULT: "#7FFF00",
          foreground: "#000000",
          dark: "#00CC00",
        },
        accent: {
          DEFAULT: "#D4A011",
          foreground: "#FFFFFF",
          hover: "#B8860B",
        },
        background: {
          DEFAULT: "#F8F5F0",
          dark: "#1F1F1F",
        },
        foreground: {
          DEFAULT: "#1F1F1F",
          light: "#F8F5F0",
        },
        card: {
          DEFAULT: "#FFFFFF",
          dark: "#2D2D2D",
        },
        muted: {
          DEFAULT: "#F8F5F0",
          foreground: "#6B6B6B",
        },
        border: "#E0E0E0",
        input: "#E0E0E0",
        ring: "#00FF00",
        destructive: "#DC2626",
        agricultural: {
          50: "#F8F5F0",
          100: "#E8E3D9",
          200: "#D4C9B5",
          300: "#BFAF8C",
          400: "#AB9668",
          500: "#9A7D4D",
          600: "#7F643D",
          700: "#5C4B2E",
          800: "#1F3A1C",
          900: "#152810",
        },
      },
      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
      },
      maxWidth: {
        "container": "1200px",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
    },
  },
};
