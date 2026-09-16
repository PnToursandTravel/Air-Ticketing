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
          disabled: "#E5D8A8",
        },
        accent: {
          gold: "#F2C94C",    // Accent Gold
          yellow: "#F2C94C",
        },
        ink: "#07111F",       // Deep Navy (Primary Typography on white canvas)
        body: {
          DEFAULT: "#475569", // Slate Cool Gray (Secondary Text on white)
          strong: "#07111F",  // Deep Navy
        },
        muted: {
          DEFAULT: "#64748B", // Cool Gray
          soft: "#94A3B8",
        },
        hairline: {
          DEFAULT: "#E2E8F0", // Subtle Blue Gray border for white background
          dark: "#24384D",    // Subtle Blue Gray for dark elements
          soft: "#F1F5F9",
        },
        canvas: "#FFFFFF",    // White Background
        surface: {
          soft: "#F8FAFC",    // Soft Slate/Off-white for alternating sections
          secondary: "#0D1B2A", // Navy Blue
          card: "#FFFFFF",    // Clean White Card
          strong: "#F1F5F9",
          dark: "#07111F",    // Deep Navy
          "dark-elevated": "#12263A", // Dark Slate
        },
        "on-primary": "#07111F", // Deep Navy text on Royal Gold
        "on-dark": {
          DEFAULT: "#F5F7FA", // Soft White (White Text on dark elements)
          soft: "#A7B1C2",    // Cool Gray on dark elements
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
