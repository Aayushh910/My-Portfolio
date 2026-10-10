/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F2F6F3',
          100: '#E2ECE5',
          200: '#C5D8CC',
          300: '#9EBEA8',
          400: '#6F8F7B', // Secondary
          500: '#47745E',
          600: '#34614D',
          700: '#285943', // Primary
          800: '#1E4433', // Primary Dark
          900: '#153124',
          950: '#0C1C14',
        },
        primary: {
          DEFAULT: '#285943',
          hover: '#1E4433',
          light: '#E9F0EC',
          active: '#153124',
        },
        secondary: {
          DEFAULT: '#6F8F7B',
          light: '#EEF4F0',
          dark: '#587462',
        },
        bgMain: '#F5F7F4',
        surface: '#FFFFFF',
        textMain: '#24302A',
        muted: '#4A5850', // High contrast WCAG AAA compliant tone (7.3:1)
        borderMuted: '#DCE4DE',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(36, 48, 42, 0.05), 0 1px 2px -1px rgba(36, 48, 42, 0.05)',
        'card': '0 2px 6px -1px rgba(36, 48, 42, 0.07), 0 2px 4px -2px rgba(36, 48, 42, 0.05)',
        'modal': '0 20px 25px -5px rgba(36, 48, 42, 0.1), 0 8px 10px -6px rgba(36, 48, 42, 0.1)',
        'toast': '0 10px 15px -3px rgba(36, 48, 42, 0.1), 0 4px 6px -4px rgba(36, 48, 42, 0.05)',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
