// Webpack config
var webpack = require('webpack');

module.exports = {

  plugins: [

    new webpack.DefinePlugin({
      'process.env': {
        IS_BROWSER: true
      }
    })

  ]
};
