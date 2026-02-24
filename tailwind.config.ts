import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            dark: '#0f172a',
            DEFAULT: '#1e3a5f',
            light: '#1e4a6d',
          },
          teal: '#0d4a4a',
          gold: {
            dark: '#b8972e',
            DEFAULT: '#d4af37',
            light: '#f4d03f',
          },
        },
        surface: {
          dark: '#f9fafb',
          card: '#ffffff',
          elevated: '#f3f4f6',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #f3f4f6 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
