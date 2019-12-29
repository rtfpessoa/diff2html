module.exports = {
  sourceMap: false,
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      browsers: 'last 2 versions',
    },
    cssnano: {},
  },
};
