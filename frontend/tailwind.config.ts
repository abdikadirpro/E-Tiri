import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        income: { DEFAULT: "#16A34A", light: "#DCFCE7", dark: "#14532D" },
        expense: { DEFAULT: "#DC2626", light: "#FEE2E2", dark: "#7F1D1D" },
        dashboard: { DEFAULT: "#2563EB", light: "#DBEAFE", dark: "#1E3A8A" },
        reports: { DEFAULT: "#EA580C", light: "#FFEDD5", dark: "#7C2D12" },
      },
    },
  },
  plugins: [],
} satisfies Config;
