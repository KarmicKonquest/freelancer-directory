/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-background': '#111827',
        'secondary-background': '#1F2937',
        'primary-accent': '#22c55e',
        'primary-text': '#F9FAFB',
        'secondary-text': '#9CA3AF',
      },
    },
  },
  plugins: [],
}
