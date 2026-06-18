/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#eef4fb',
          100: '#d6e4f3',
          200: '#aec8e6',
          300: '#7ea6d4',
          400: '#4b81be',
          500: '#2a61a3',
          600: '#1e3a5f',
          700: '#19304d',
          800: '#13253b',
          900: '#0d1a29',
        },
        accent: {
          50: '#fff5ed',
          100: '#ffe6d3',
          200: '#ffc9a3',
          300: '#ffa566',
          400: '#ff7f33',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
