import path from "path";

import webpack from "webpack";
import { Plugin } from "postcss";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import autoprefixer from "autoprefixer";
import CopyWebpackPlugin from "copy-webpack-plugin";

const isDevelopment = process.env.NODE_ENV !== "production";
const minimize = process.env.WEBPACK_MINIFY === "true";

const pages = ["index", "demo"];

const config: webpack.Configuration[] = pages.map(page => {
  return {
    devServer: {
      port: 3000,
      open: true,
      contentBase: path.join(__dirname, "./website")
    },
    entry: {
      [page]: `./website/templates/pages/${page}/${page}.ts`
    },
    output: {
      path: path.resolve(__dirname, "./docs")
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"]
    },
    optimization: { minimize },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/
        },
        {
          test: /\.handlebars$/,
          loader: "handlebars-loader",
          options: {
            precompileOptions: {
              knownHelpersOnly: false
            },
            helperDirs: [path.join(__dirname, "website/templates/helpers")],
            partialDirs: [path.join(__dirname, "website/templates")]
          }
        },
        {
          test: /\.(css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                sourceMap: isDevelopment
              }
            },
            {
              loader: "postcss-loader",
              options: {
                autoprefixer: {
                  browsers: ["last 2 versions"]
                },
                sourceMap: isDevelopment,
                plugins: (): Plugin<object>[] => [autoprefixer]
              }
            }
          ]
        },
        {
          test: /\.(html)$/,
          use: {
            loader: "html-loader",
            options: {
              attrs: ["img:src"]
            }
          }
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 1000,
                mimetype: "application/font-woff"
              }
            }
          ]
        },
        {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "file-loader"
        },
        {
          test: /\.(jpeg|jpg|png|gif)$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]",
                outputPath: "images/",
                useRelativePath: true
              }
            },
            {
              loader: "image-webpack-loader",
              options: {
                mozjpeg: {
                  progressive: true,
                  quality: 65
                },
                optipng: {
                  enabled: true
                },
                pngquant: {
                  quality: [0.65, 0.9],
                  speed: 4
                },
                gifsicle: {
                  interlaced: false
                },
                webp: {
                  quality: 75
                }
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      }),
      new HtmlWebpackPlugin({
        hash: true,
        inject: true,
        title: `${page} page`,
        filename: `${page}.html`,
        template: `./website/templates/pages/${page}/${page}.handlebars`,
        minify: !isDevelopment && {
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
          minifyURLs: true
        }
      }),
      new CopyWebpackPlugin([
        { from: "website/favicon.ico", to: "favicon.ico" },
        { from: "website/robots.txt", to: "robots.txt" },
        { from: "website/sitemap.xml", to: "sitemap.xml" }
      ])
    ]
  };
});

export default config;
