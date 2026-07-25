import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm neutral system sampled from the product film
        canvas: "#F4F0E9", // page base — warm bone
        sand: {
          50: "#FAF7F2",
          100: "#F1ECE3",
          200: "#E7E0D4",
          300: "#D8CEBD",
        },
        clay: "#C7A57B", // restrained warm accent
        ink: {
          DEFAULT: "#211E1A", // warm near-black
          soft: "#5A544B",
          faint: "#8A8377",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.28em",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        cue: {
          "0%": { transform: "translateY(0)", opacity: "0.15" },
          "50%": { transform: "translateY(9px)", opacity: "1" },
          "100%": { transform: "translateY(0)", opacity: "0.15" },
        },
      },
      animation: {
        cue: "cue 2.4s cubic-bezier(0.16,1,0.3,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
