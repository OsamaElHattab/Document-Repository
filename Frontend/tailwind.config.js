/** @type {import('tailwindcss').Config} */

import withMT from '@material-tailwind/react/utils/withMT';

export default withMT({
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '3rem',
      },
    },
    extend: {
      colors: {
        // color Palette
        'color-first': '#013145',
        'color-second': '#046b78',
        'color-third': '#02a0b5',
        'color-fourth': '#BBE1FA',
        // dark and light colors
        'color-background-light': '#e9ecef',
        'color-background-light-second': '#ffffff',
        'color-background-light-third': '#f0f0f0',
        'color-background-dark': '#181818',
        'color-background-dark-second': '#23272b',
        'color-background-dark-third': '#15171a',
        'color-text-light': '#1B262C',
        'color-text-dark': '#e9ecef',
        blue: '#014980',
      },
      width: {
        'fit-content': 'fit-content',
      },
    },
  },
  plugins: [],
});
