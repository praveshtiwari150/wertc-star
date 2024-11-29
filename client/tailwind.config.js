/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          '1': '#929195',
          '2': '#79787c',
          '3': '#605f64',
          '4': '#49484d',
          '5': '#333238',
          '6': '#1e1d23',
          '7': '#17161a',
          '8': '#111013',
          '9': '#0a0a0d',
          '10': '#040406'
        },
        inidgo: {
          '1': '#d0cded',
          '2': '#c4c0e8',
          '3': '#b9b4e3',
          '4': '#ada8df',
          '5': '#a19dda',
          '6': '#9591d5'
        },
        cobalt: {
          '1': '#F8F9FA',  // Lightest
          '2': '#F0E6F6',
          '3': '#C5B3D9',
          '4': '#8467D7',
          '5': '#6D58C9',
          '6': '#5741BA',
          '7': '#422BAA',
          '8': '#2E1B9A',
          '9': '#1B0C89',
          '10': '#08007A'  // Darkest
        },
        emerald: {
          '1': '#E8F6F2',  // Lightest
          '2': '#C2E9DE',
          '3': '#97DBCA',
          '4': '#6BCCB6',
          '5': '#3FBEA2',
          '6': '#1EA88C',
          '7': '#178C72',
          '8': '#106F59',
          '9': '#09533F',
          '10': '#033826'  // Darkest
        },
        // Complementary secondary color palette
        warmGray: {
          '1': '#e0e0e2',
          '2': '#c6c6ca',
          '3': '#acacb2',
          '4': '#94949a',
          '5': '#7c7c82',
          '6': '#65656a',
          '7': '#505055',
          '8': '#3d3d42',
          '9': '#2a2a30',
          '10': '#18181e'
        },

        snow: {
          '1': '#FFFFFF',  // Pure White
          '2': '#F8F9FA',  // Soft White
          '3': '#F2F3F4',  // Whisper White
          '4': '#ECECEC',  // Frost White
          '5': '#E6E6E6',  // Snow White
          '6': '#E0E0E0',  // Moon White
          '7': '#DADADA',  // Mist White
          '8': '#D4D4D4',  // Cloud White
          '9': '#CECECE',  // Pearl White
          '10': '#C8C8C8'  // Ivory White
        }



      },
    
    },
  },
  plugins: [],
}
