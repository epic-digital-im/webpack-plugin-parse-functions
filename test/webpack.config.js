const path = require('path');
const ParseFunctionsPlugin = require('../dist/main').default;
// const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');


const isProduction = process.env.NODE_ENV == 'production';

const config = {
  target: 'node',
  node: {
    global: true,
    __dirname: true,
    __filename: true,
  },
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    module: true,
    libraryTarget: 'module',
    chunkFormat: 'module',
  },
  plugins: [
    // new NodePolyfillPlugin(),
    new ParseFunctionsPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    fallback: {
      url: require.resolve('url'),
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-js'),
      buffer: require.resolve('buffer'),
    },
  },
  experiments: {
    outputModule: true,
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
