import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rice: "#fbfef9",
        charcoal: "#191923",
        leaf: "#0e79b2",
        chili: "#0e79b2",
        turmeric: "#0e79b2",
        ink: "#252530",
        smoke: "#edf6fb"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(25, 25, 35, 0.12)",
        pin: "0 10px 30px rgba(14, 121, 178, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
