import type { Config } from "tailwindcss";

/**
 * Clinica design system.
 * Warm paper canvas, plum brand, gold accent — chosen to read as a premium
 * aesthetics brand while staying calm enough for eight hours of daily use.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F2F0",
        surface: "#FFFFFF",
        raised: "#FCFAF9",
        line: "#EBE3DF",
        "line-strong": "#DACFC9",
        ink: {
          DEFAULT: "#1D1219",
          2: "#4C3C46",
          3: "#7C6B75",
          4: "#A99CA3",
        },
        brand: {
          DEFAULT: "#7A2F5F",
          ink: "#4A1739",
          hover: "#68284F",
          soft: "#F6E9F0",
          softer: "#FBF4F8",
          line: "#E7CEDC",
        },
        gold: {
          DEFAULT: "#B0813F",
          soft: "#FAF1E3",
          line: "#EBD8B8",
        },
        success: {
          DEFAULT: "#1B7A5A",
          soft: "#E5F2EC",
          line: "#BFE0D3",
        },
        warn: {
          DEFAULT: "#A96E0C",
          soft: "#FCF2DF",
          line: "#EBD8AE",
        },
        danger: {
          DEFAULT: "#AC2B22",
          soft: "#FAEAE8",
          line: "#EDC9C5",
        },
        info: {
          DEFAULT: "#2A5EA6",
          soft: "#EAF0FA",
          line: "#C7D8F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        arabic: ["var(--font-arabic)", "var(--font-sans)", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(29, 18, 25, 0.05)",
        card: "0 1px 2px rgba(29, 18, 25, 0.04), 0 1px 1px rgba(29, 18, 25, 0.02)",
        raise: "0 2px 4px rgba(29, 18, 25, 0.05), 0 8px 20px -8px rgba(29, 18, 25, 0.12)",
        pop: "0 12px 32px -8px rgba(29, 18, 25, 0.18), 0 2px 6px rgba(29, 18, 25, 0.06)",
        overlay: "0 24px 64px -16px rgba(29, 18, 25, 0.32)",
        "inset-line": "inset 0 0 0 1px rgba(29, 18, 25, 0.06)",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "8.5": "2.125rem",
        13: "3.25rem",
        18: "4.5rem",
        22: "5.5rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "translateY(6px) scale(0.985)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "slide-in-end": {
          from: { transform: "translateX(var(--slide-from, 24px))", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "fade-in": "fade-in 160ms ease-out both",
        "scale-in": "scale-in 180ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-end": "slide-in-end 240ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
