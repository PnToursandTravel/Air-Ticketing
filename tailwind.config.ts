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
          DEFAULT: "#0052ff",
          active: "#003ecc",
          disabled: "#a8b8cc",
        },
        ink: "#0a0b0d",
        body: {
          DEFAULT: "#5b616e",
          strong: "#0a0b0d",
        },
        muted: {
          DEFAULT: "#7c828a",
          soft: "#a8acb3",
        },
        hairline: {
          DEFAULT: "#dee1e6",
          soft: "#eef0f3",
        },
        canvas: "#ffffff",
        surface: {
          soft: "#f7f7f7",
          card: "#ffffff",
          strong: "#eef0f3",
          dark: "#0a0b0d",
          "dark-elevated": "#16181c",
        },
        "on-primary": "#ffffff",
        "on-dark": {
          DEFAULT: "#ffffff",
          soft: "#a8acb3",
        },
        semantic: {
          up: "#05b169",
          down: "#cf202f",
        },
        accent: {
          yellow: "#f4b000",
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
