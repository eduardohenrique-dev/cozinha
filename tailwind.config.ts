import type { Config } from "tailwindcss";

// Paleta fechada: só os tokens do projeto, nenhuma cor default do Tailwind.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      bg: "rgb(var(--c-bg) / <alpha-value>)",
      surface: "rgb(var(--c-surface) / <alpha-value>)",
      line: {
        DEFAULT: "rgb(var(--c-line) / <alpha-value>)",
        strong: "rgb(var(--c-line-strong) / <alpha-value>)",
      },
      primary: {
        DEFAULT: "rgb(var(--c-primary) / <alpha-value>)",
        soft: "rgb(var(--c-primary-soft) / <alpha-value>)",
        deep: "rgb(var(--c-primary-deep) / <alpha-value>)",
      },
      accent: {
        DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",
        soft: "rgb(var(--c-accent-soft) / <alpha-value>)",
        strong: "rgb(var(--c-accent-strong) / <alpha-value>)",
      },
      warn: {
        DEFAULT: "rgb(var(--c-warn) / <alpha-value>)",
        soft: "rgb(var(--c-warn-soft) / <alpha-value>)",
        strong: "rgb(var(--c-warn-strong) / <alpha-value>)",
      },
      danger: {
        DEFAULT: "rgb(var(--c-danger) / <alpha-value>)",
        soft: "rgb(var(--c-danger-soft) / <alpha-value>)",
        strong: "rgb(var(--c-danger-strong) / <alpha-value>)",
      },
      text: {
        DEFAULT: "rgb(var(--c-text) / <alpha-value>)",
        muted: "rgb(var(--c-text-muted) / <alpha-value>)",
        faint: "rgb(var(--c-text-faint) / <alpha-value>)",
      },
    },
    fontFamily: {
      display: ["var(--font-fraunces)", "Georgia", "serif"],
      sans: ["var(--font-general)", "system-ui", "sans-serif"],
    },
    extend: {
      borderRadius: {
        card: "24px 8px 24px 8px",
        "card-alt": "8px 24px 8px 24px",
        blob: "60% 40% 55% 45% / 45% 55% 45% 55%",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(61 56 51 / 0.04), 0 8px 24px -8px rgb(61 56 51 / 0.10)",
        lift: "0 2px 4px rgb(61 56 51 / 0.05), 0 20px 40px -16px rgb(61 56 51 / 0.18)",
      },
      transitionTimingFunction: {
        organic: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      maxWidth: {
        shell: "64rem",
      },
    },
  },
  plugins: [],
};
export default config;
