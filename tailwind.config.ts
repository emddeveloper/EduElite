import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        secondary: '#101828',
        accent: '#F43F5E',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 24 40 / 0.06), 0 1px 3px 0 rgb(16 24 40 / 0.10)',
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
}

export default config
