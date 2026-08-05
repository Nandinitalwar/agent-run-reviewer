import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        accent: {
          success: "#10B981", // Emerald
          fail: "#EF4444",    // Red
          warning: "#F59E0B", // Amber
          info: "#3B82F6",    // Blue
        }
      },
    },
  },
  plugins: [],
};
export default config;
