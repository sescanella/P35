/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Only habit identification colors
        'habit-yellow': '#FBBA16',
        'habit-dark-green': '#00492C', 
        'habit-light-blue': '#9BCCD0',
        'habit-red': '#E22028',
        'habit-pink': '#E2B2B4',
        'habit-dark-blue': '#1E4380',
        'habit-light-green': '#B1D8B8',
        // iOS dark mode background
        'ios-dark': '#1C1C1E',
      }
    },
  },
  plugins: [],
  safelist: [
    'bg-habit-yellow',
    'bg-habit-dark-green', 
    'bg-habit-light-blue',
    'bg-habit-red',
    'bg-habit-pink',
    'bg-habit-dark-blue',
    'bg-habit-light-green',
    'border-habit-yellow',
    'border-habit-dark-green', 
    'border-habit-light-blue',
    'border-habit-red',
    'border-habit-pink',
    'border-habit-dark-blue',
    'border-habit-light-green',
  ]
}
