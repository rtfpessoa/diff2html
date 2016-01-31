// Webpack config
var webpack = require('webpack');

module.exports = {

  plugins: [

    new webpack.NormalModuleReplacementPlugin(
      /(nunjucks)$/,
      'nunjucks/index'
    ),

    new webpack.NormalModuleReplacementPlugin(
      /(precompile|nodes|lexer|parser|transformer|compiler|loaders)$/,
      'node-libs-browser/mock/empty'
    ),

    new webpack.DefinePlugin({
      'process.env': {
        IS_BROWSER: true
      }
    })

  ]
};
