/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#0a0518', // Darker, richer black/blue
          primary: '#d946ef', // Fuchsia 500 - Electric Pink
          secondary: '#06b6d4', // Cyan 500 - Electric Blue
          accent: '#f59e0b', // Amber 500 - Gold/Energy
          surface: 'rgba(255, 255, 255, 0.08)',
          'surface-hover': 'rgba(255, 255, 255, 0.12)',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Fredoka One', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(217,70,239,0.5))' },
          '50%': { opacity: 0.8, filter: 'brightness(1) drop-shadow(0 0 5px rgba(217,70,239,0.2))' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)",
        'radial-gradient': "radial-gradient(circle at center, var(--tw-gradient-stops))",
      },
      backgroundSize: {
        'grid-pattern': '40px 40px',
      }
    },
  },
  plugins: [],
}
