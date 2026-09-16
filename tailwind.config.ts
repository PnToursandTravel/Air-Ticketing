import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D4AF37", // Royal Gold
          bright: "#F2C94C",  // Accent Gold
          active: "#B8972E",  // Deepened Gold
          disabled: "#5A4B20",
        },
        accent: {
          gold: "#F2C94C",    // Accent Gold
          yellow: "#F2C94C",
        },
        ink: "#F5F7FA",       // Soft White (White Text)
        body: {
          DEFAULT: "#A7B1C2", // Cool Gray (Secondary Text)
          strong: "#F5F7FA",  // Soft White
        },
        muted: {
          DEFAULT: "#A7B1C2", // Cool Gray
          soft: "#738096",
        },
        hairline: {
          DEFAULT: "#24384D", // Subtle Blue Gray (Border)
          soft: "#1A2A3A",
        },
        canvas: "#07111F",    // Deep Navy (Primary Background)
        surface: {
          soft: "#0D1B2A",    // Navy Blue (Secondary Background)
          secondary: "#0D1B2A",
          card: "#12263A",    // Dark Slate (Card Background)
          strong: "#12263A",  // Dark Slate
          dark: "#07111F",    // Deep Navy
          "dark-elevated": "#12263A", // Dark Slate
        },
        "on-primary": "#07111F", // Deep Navy text on Royal Gold
        "on-dark": {
          DEFAULT: "#F5F7FA", // Soft White
          soft: "#A7B1C2",    // Cool Gray
        },
        semantic: {
          up: "#22C55E",      // Green (Success/Profit)
          down: "#EF4444",    // Red (Danger/Loss)
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "100px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        base: "16px",
        md: "20px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
      },
      fontFamily: {
        display: ["Inter", "-apple-system", "system-ui", "sans-serif"],
        sans: ["Inter", "-apple-system", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Geist Mono", "monospace"],
      },
      boxShadow: {
        "soft-drop": "0 4px 12px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
