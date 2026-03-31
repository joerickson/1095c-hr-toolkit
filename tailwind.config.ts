import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#e8eef5",
          100: "#c5d5e8",
          200: "#9db9d9",
          300: "#749dcb",
          400: "#4d83be",
          500: "#2d6aaf",
          600: "#1f5491",
          700: "#1a3a5c",
          800: "#142d47",
          900: "#0d1f31",
        },
      },
    },
  },
  plugins: [],
};
export default config;
