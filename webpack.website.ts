import path from 'path';
import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
// eslint-disable-next-line import/default
import CopyPlugin from 'copy-webpack-plugin';

const config = {
  output: {
    path: path.resolve(__dirname, './docs'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: './website/templates/pages/index/index.handlebars', // => docs/index.html,
        demo: './website/templates/pages/demo/demo.handlebars', // => docs/demo.html
      },
      js: {
        // output filename of compiled JavaScript, used if `inline` option is false (defaults)
        filename: '[name].[contenthash:8].js',
        //inline: true, // inlines JS into HTML
      },
      css: {
        // output filename of extracted CSS, used if `inline` option is false (defaults)
        filename: '[name].[contenthash:8].css',
        //inline: true, // inlines CSS into HTML
      },
      preprocessor: 'handlebars', // use the handlebars compiler
      preprocessorOptions: {
        knownHelpersOnly: false,
        helpers: [path.join(__dirname, 'website/templates/helpers')],
        partials: [path.join(__dirname, 'website/templates/partials'), path.join(__dirname, 'website/templates/pages')],
      },
      minify: 'auto', // minify in production mode only
      minifyOptions: {
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
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(gif|png|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]?[hash]',
        },
        use: [
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
        use: [{ loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader'],
      },
      {
        test: /\.woff(2)?(\?v=\d\.\d\.\d)?$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1000,
          },
        },
      },
      {
        test: /\.(ttf|eot|svg)(\?v=\d\.\d\.\d)?$/,
        type: 'asset/resource',
      },
    ],
  },
  // enable live reload after changes
  devServer: {
    static: path.resolve(__dirname, './docs'),
    watchFiles: {
      paths: ['website/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};

export default config;
