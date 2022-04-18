module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}', './public/index.html'],
  theme: {
    colors: {
      primary: '#FFFDA3',
      black: '#000',
      white: '#fff',
    },
    extend: {
      '-my': {
        'px': '-1px',
      },
      spacing: {
        120: '30rem',
      },
    },
    fontFamily: {
      'mono': ['Roboto Mono']
    },
  },
  plugins: []
};