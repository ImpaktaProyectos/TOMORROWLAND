import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#070a16",
        "night-2": "#0c1020",
        "blue-atmos": "#1b2a63",
        cobalt: "#2b4bd6",
        violetdeep: "#3a2a6b",
        ivory: "#f3ead6",
        gold: "#d8b667",
        "gold-soft": "#e8d3a0",
        turquoise: "#4fd6c8",
        muted: "#9aa3c0",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        halo: "0 0 60px -12px rgba(79,214,200,0.25)",
        card: "0 8px 40px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        fadein: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        fadein: "fadein .5s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
