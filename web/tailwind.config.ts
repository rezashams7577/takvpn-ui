import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import sharedPreset from "@takvpn/shared/tailwind-preset";

const config: Config = {
  presets: [sharedPreset as Config],
  plugins: [typography],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d9f1ff",
          200: "#bae6fd",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
    },
  },
};
export default config;
