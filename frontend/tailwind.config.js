import { defineConfig } from "@tailwindcss/vite";

export default defineConfig({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6f6ff",
          100: "#ccefff",
          200: "#99dfff",
          300: "#66cfff",
          400: "#33bfff",
          500: "#04a9f5",
          600: "#0392d3",
          700: "#027bb1",
          800: "#01648f",
          900: "#014e70",
        },
        sidebar: {
          700: "#2f3d44",
          800: "#263238",
          900: "#1e272c",
        },
        success: {
          500: "#1de9b6",
          600: "#12c9a0",
        },
      },
    },
  },
  plugins: [],
});
