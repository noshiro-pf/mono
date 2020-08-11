'use strict';
exports.__esModule = true;
var path = require('path');
var rules = [
  {
    test: /\.ts$/,
    exclude: [/node_modules/],
    use: {
      loader: 'ts-loader',
      options: {
        configFile: 'tsconfig.lib.json',
      },
    },
  },
];
var config = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(process.cwd() + '/lib'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: { rules: rules },
};
exports['default'] = config;
