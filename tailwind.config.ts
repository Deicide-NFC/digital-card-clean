import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        brand: { DEFAULT: "#2347F0", dark: "#1A37C4", soft: "#E8ECFE" },
        mist: "#F3F5F9",
        line: "#E3E7EF",
        // Public profile colours are driven by CSS variables (see globals.css)
        pf: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          text: "var(--text)",
          muted: "var(--muted)",
          line: "var(--line)",
          accent: "var(--accent)",
          "on-accent": "var(--on-accent)",
          soft: "var(--accent-soft)",
          fg: "var(--accent-fg)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
