/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sidebar theme
        sidebar: {
          DEFAULT: '#4A4A4A',
          hover: '#585858',
          border: '#5C5C5C',
          text: '#D8D8D8',
          activeBg: '#FF5A14',
          activeText: '#FFFFFF',
        },
        // Surfaces — Light Background (#FFFFFF), Input Background (#FFF7F2), Light Border (#D8D8D8), Orange Border (#FF8A55)
        paper: {
          50:  '#FFFFFF',
          100: '#FFFFFF',  // Light Background (#FFFFFF)
          200: '#FFF7F2',  // Input Background (#FFF7F2)
          300: '#D8D8D8',  // Light Border (#D8D8D8)
          400: '#FF8A55',  // Orange Border (#FF8A55)
          500: '#B0B0B0',  // Placeholder (#B0B0B0)
        },
        // Text — Primary Text (#666666), Secondary Text (#888888), Placeholder (#B0B0B0)
        ink: {
          900: '#4A4A4A', // Dark text / Headings
          800: '#666666', // Primary Text (#666666)
          700: '#666666', // Primary Text (#666666)
          600: '#888888', // Secondary Text (#888888)
          500: '#888888', // Secondary Text (#888888)
          400: '#B0B0B0', // Placeholder (#B0B0B0)
          300: '#D8D8D8', // Light Border (#D8D8D8)
        },
        // Primary Orange (#FF5A14), Button Orange (#FF7A45), Hover Orange (#F56B2F)
        accent: {
          50:  '#FFF7F2',  // Input Background (#FFF7F2)
          100: '#FFEFE6',
          200: '#FFD7C4',
          300: '#FFB394',
          400: '#FF8A55',  // Orange Border (#FF8A55)
          500: '#FF5A14',  // Primary Orange (#FF5A14)
          600: '#FF7A45',  // Button Orange (#FF7A45)
          700: '#F56B2F',  // Hover Orange (#F56B2F)
          800: '#D94808',
          900: '#B03500',
        },
        // Explicit named tokens matching user palette
        brand: {
          primary: '#FF5A14',
          button: '#FF7A45',
          hover: '#F56B2F',
          sidebar: '#4A4A4A',
          bg: '#FFFFFF',
          inputBg: '#FFF7F2',
          lightBorder: '#D8D8D8',
          orangeBorder: '#FF8A55',
          primaryText: '#666666',
          secondaryText: '#888888',
          placeholder: '#B0B0B0',
          white: '#FFFFFF',
        },
        // Status — calibrated for warm orange theme
        gold: {
          50:  '#fffbf0',
          100: '#feebc8',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        crimson: {
          50:  '#fff5f5',
          100: '#fed7d7',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        emerald: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        violet: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        sky: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Space Grotesk', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Subtle, layered — never garish
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        pop: '0 10px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
      },
      borderRadius: {
        xl2: '1rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      },
    },
  },
  plugins: [],
};
