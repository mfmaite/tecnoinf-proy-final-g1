/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          50: '#FFF6ED',
          100: '#FFE8D2',
          200: '#FFD0A8',
          300: '#FFB170',
          400: '#FF9440',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Secondary Colors
        secondary: {
          50: '#F4FBF8',
          100: '#DBF5E9',
          200: '#AFE8CE',
          300: '#7AD2AA',
          400: '#4CB689',
          500: '#2E7D58',
          600: '#256948',
          700: '#1E553A',
          800: '#18432E',
          900: '#123223',
        },
        // Text Colors
        text: {
          primary: '#1B1B1B',
          secondary: '#374151',
          muted: '#6B7280',
          inverse: '#FFFFFF',
          link: '#007BFF',
          linkHover: '#0056b3',
        },
        // Background Colors
        background: {
          light: '#FFFDF9',
          main: '#FAF7F2',
          alt: '#F1EDE7',
        },
        // Accent Colors
        accent: {
          success: '#16A34A',
          info: '#0EA5E9',
          warning: '#FACC15',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        lato: ['var(--font-lato)', 'sans-serif'],
      },
      fontSize: {
        // Headings
        'h1': ['40px', '48px'],
        'h2': ['32px', '40px'],
        'h3': ['24px', '32px'],
        'h4': ['20px', '24px'],
        'h5': ['18px', '24px'],
        'h6': ['16px', '22px'],
        // Text
        'text-large': ['20px', '28px'],
        'text-medium': ['16px', '26px'],
        'text-small': ['14px', '20px'],
        'text-tiny': ['12px', '16px'],
        'text-xtiny': ['10px', '16px'],
      },
      fontWeight: {
        regular: '400',
        semibold: '500',
        bold: '700',
      },
    },
  },
  plugins: [],
};
