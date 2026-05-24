import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        foreground: "var(--fg)",
        card: "var(--card)",
        muted: "var(--muted)",
        border: "var(--border)",
        input: "var(--input-bg)",
      },
      fontFamily: {
        sans: ["Vazirmatn", "Tahoma", "Segoe UI", "sans-serif"],
        brand: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
};

export default preset;
