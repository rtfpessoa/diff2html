import path from 'path';

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const pages = ['index', 'demo'];

function plugins(page: string): webpack.WebpackPluginInstance[] {
  return [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      hash: true,
      inject: true,
      title: `${page} page`,
      filename: `${page}.html`,
      template: `./website/templates/pages/${page}/${page}.handlebars`,
      minify: {
        html5: true,
        collapseWhitespace: true,
        caseSensitive: true,
        removeEmptyElements: false,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'website/favicon.ico', to: 'favicon.ico' },
        { from: 'website/robots.txt', to: 'robots.txt' },
        { from: 'website/sitemap.xml', to: 'sitemap.xml' },
      ],
    }),
  ];
}

const config: webpack.Configuration[] = pages.map(page => {
  return {
    entry: {
      [page]: `./website/templates/pages/${page}/${page}.ts`,
    },
    output: {
      path: path.resolve(__dirname, './docs'),
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(html)$/,
          use: {
            loader: 'html-loader',
            options: {
              attrs: ['img:src'],
            },
          },
        },
        {
          test: /\.handlebars$/,
          loader: 'handlebars-loader',
          options: {
            inlineRequires: '/images/',
            precompileOptions: {
              knownHelpersOnly: false,
            },
            helperDirs: [path.join(__dirname, 'website/templates/helpers')],
            partialDirs: [path.join(__dirname, 'website/templates')],
          },
        },
        {
          test: /\.(gif|png|jpe?g|webp)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]?[hash]',
                outputPath: 'images',
                esModule: false,
              },
            },
            {
              loader: 'image-webpack-loader',
              options: {
                mozjpeg: {
                  progressive: true,
                  quality: 65,
                },
                optipng: {
                  enabled: true,
                },
                pngquant: {
                  quality: [0.65, 0.9],
                  speed: 4,
                },
                gifsicle: {
                  interlaced: false,
                },
                webp: {
                  quality: 75,
                },
              },
            },
          ],
        },
        {
          test: /\.(css)$/,
          use: [MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader'],
        },
        {
          test: /\.woff(2)?(\?v=\d\.\d\.\d)?$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 1000,
                mimetype: 'application/font-woff',
              },
            },
          ],
        },
        {
          test: /\.(ttf|eot|svg)(\?v=\d\.\d\.\d)?$/,
          loader: 'file-loader',
        },
      ],
    },
    plugins: plugins(page),
  };
});

export default config;
