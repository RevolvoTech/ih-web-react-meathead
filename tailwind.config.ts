import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        meathead: {
          red: "#C41E3A",
          black: "#0A0A0A",
          charcoal: "#1A1A1A",
          gray: "#2A2A2A",
        },
      },
      fontFamily: {
        heading: ["Anton", "sans-serif"],
        data: ["Space Grotesk", "monospace"],
        inter: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.05em",
      },
    },
  },
  plugins: [],
};
export default config;
