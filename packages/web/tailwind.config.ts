import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        upwork: {
          green: '#14a800',
          'green-dark': '#108a00',
          'green-light': '#5bbd72',
          black: '#001e00',
          'dark-gray': '#1f1f1f',
          'medium-gray': '#6e6e6e',
          'light-gray': '#d4d4d4',
        },
      },
    },
  },
  plugins: [],
}
export default config
