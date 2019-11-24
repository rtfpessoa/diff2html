import path from "path";

import webpack from "webpack";

const minimize = process.env.WEBPACK_MINIFY === "true";

const diff2htmlBrowserConfig: webpack.Configuration = {
  mode: "production",
  optimization: { minimize: minimize },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"]
  },
  entry: "./src/diff2html.ts",
  output: {
    path: path.resolve(__dirname, "bundles/js"),
    libraryTarget: "umd",
    globalObject: "this",
    library: "Diff2Html",
    filename: `diff2html${minimize ? ".min" : ""}.js`,
    umdNamedDefine: true
  }
};

const diff2htmlUIBrowserConfig: webpack.Configuration = {
  mode: "production",
  optimization: { minimize: minimize },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"]
  },
  entry: "./src/ui/js/diff2html-ui.ts",
  output: {
    path: path.resolve(__dirname, "bundles/js"),
    libraryTarget: "umd",
    globalObject: "this",
    filename: `diff2html-ui${minimize ? ".min" : ""}.js`,
    umdNamedDefine: true
  }
};

const config: webpack.Configuration[] = [diff2htmlBrowserConfig, diff2htmlUIBrowserConfig];

export default config;
