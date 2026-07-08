/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#A66A2C',
          hover: '#8C5623',
          light: '#F4ECE4',
        },
        secondary: {
          DEFAULT: '#2B2B2B',
          hover: '#1F1F1F',
          light: '#E5E5E5',
        },
        background: '#F8F8F8',
        card: '#FFFFFF',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        darkText: '#222222',
      },
      borderRadius: {
        'large': '12px',
      },
      boxShadow: {
        'premium': '0 4px 30px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 10px 30px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
