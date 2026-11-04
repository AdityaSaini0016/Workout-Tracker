export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ccff00',
          hover: '#b3e600',
          dark: '#99cc00',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          card: '#121212',
          border: '#27272a',
          hover: '#1a1a1e',
        }
      },
    },
  },
  plugins: [],
}
