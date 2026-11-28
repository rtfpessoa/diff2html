import path from 'path';

import type webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const pages = ['index', 'demo'];

type Plugin = ((this: webpack.Compiler, compiler: webpack.Compiler) => void) | webpack.WebpackPluginInstance;

function plugins(page: string): Plugin[] {
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
    new CopyPlugin({
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
    // The dev-server client filters updates by compiler name in multi-compiler builds.
    name: page,
    entry: {
      [page]: `./website/templates/pages/${page}/${page}.ts`,
    },
    output: {
      path: path.resolve(import.meta.dirname, './docs'),
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: { loader: 'ts-loader', options: { configFile: 'tsconfig.website.json' } },
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
            helperDirs: [path.join(import.meta.dirname, 'website/templates/helpers')],
            partialDirs: [path.join(import.meta.dirname, 'website/templates')],
          },
        },
        {
          test: /\.(gif|png|jpe?g|webp)$/i,
          type: 'asset/resource',
          generator: { filename: 'images/[name][ext]?[contenthash]' },
        },
        {
          test: /\.(css)$/,
          use: [MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader'],
        },
        {
          test: /\.woff2?$/,
          type: 'asset',
          parser: { dataUrlCondition: { maxSize: 1000 } },
          generator: { dataUrl: { mimetype: 'application/font-woff' } },
        },
        {
          test: /\.(ttf|eot|svg)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: plugins(page),
  };
});

export default config;
