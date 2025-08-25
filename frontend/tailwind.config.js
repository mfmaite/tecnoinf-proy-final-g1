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
        // Primary Colors (Naranja)
        'primary-color': {
          10: '#FFF6ED',
          20: '#FFE8D2',
          30: '#FFD0A8',
          40: '#FFB170',
          50: '#FF9440',
          60: '#F97316',
          70: '#E66112',
          80: '#CC540F',
          90: '#B1470B',
          100: '#993808',
        },
        // Secondary Colors (Verde oscuro del logo)
        'secondary-color': {
          10: '#E6F0E8',
          20: '#CCE1D0',
          30: '#99C3A1',
          40: '#66A672',
          50: '#338A43',
          60: '#266C35',
          70: '#1A4D26',
          80: '#0D2F18',
          90: '#00100A',
          100: '#000000',
        },
        // Text Neutral
        'text-neutral': {
          10: '#F5F4F1',
          20: '#EAE8E3',
          30: '#DCE1DE',
          40: '#999999',
          50: '#333333',
        },
        // Surfaces Light
        'surface-light': {
          10: '#FFFFFF',
          20: '#FAF9F6',
          30: '#F5F4F1',
          40: '#EAE8E3',
          50: '#DCE1DE',
        },
        // Surfaces Dark
        'surface-dark': {
          10: '#E5E5E5',
          20: '#CCCCCC',
          30: '#999999',
          40: '#666666',
          50: '#333333',
        },
        // Accent Success
        'accent-success': {
          10: '#EBF9DD',
          20: '#C0DDA4',
          30: '#85AE5D',
          40: '#4A7F16',
          50: '#2C4C0D',
        },
        // Accent Info
        'accent-info': {
          10: '#F4F8FA',
          20: '#BBD5DF',
          30: '#8DB9CA',
          40: '#779FAE',
          50: '#3F5D69',
        },
        // Accent Warning
        'accent-warning': {
          10: '#FFF2CC',
          20: '#FFDC73',
          30: '#FFBF3F',
          40: '#ECB100',
          50: '#99770F',
        },
        // Accent Danger
        'accent-danger': {
          10: '#F9DDDD',
          20: '#ED9998',
          30: '#E15554',
          40: '#B64444',
          50: '#612323',
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
