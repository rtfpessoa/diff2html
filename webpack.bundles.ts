import path from 'path';

import webpack from 'webpack';

const diff2htmlBrowserConfig: webpack.Configuration = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  entry: './src/diff2html.ts',
  output: {
    path: path.resolve(__dirname, 'bundles/js'),
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'Diff2Html',
    filename: 'diff2html.min.js',
    umdNamedDefine: true,
  },
};

function diff2htmlUIBrowserConfig(entrypointName: string): webpack.Configuration {
  return {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    entry: `./src/ui/js/${entrypointName}.ts`,
    output: {
      path: path.resolve(__dirname, 'bundles/js'),
      libraryTarget: 'umd',
      globalObject: 'this',
      filename: `${entrypointName}.min.js`,
      umdNamedDefine: true,
    },
  };
}

const config: webpack.Configuration[] = [
  diff2htmlBrowserConfig,
  diff2htmlUIBrowserConfig('diff2html-ui'),
  diff2htmlUIBrowserConfig('diff2html-ui-slim'),
  diff2htmlUIBrowserConfig('diff2html-ui-base'),
];

export default config;
