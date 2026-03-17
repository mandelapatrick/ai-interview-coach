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
          lime: {
            dark: '#a8e05f',
            DEFAULT: '#c1f879',
            light: '#d4ffa0',
          },
        },
        surface: {
          dark: '#f9fafb',
          card: '#ffffff',
          elevated: '#f3f4f6',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #f3f4f6 100%)',
        'lime-gradient': 'linear-gradient(135deg, #c1f879 0%, #d4ffa0 50%, #c1f879 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
