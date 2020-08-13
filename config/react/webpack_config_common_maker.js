'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.webpackConfigCommonMaker = exports.pluginsCommon = void 0;
var tslib_1 = require('tslib');
var dotenv_webpack_1 = tslib_1.__importDefault(require('dotenv-webpack'));
require('webpack-dev-server');
var rulesMaker = function (pathToTsconfigJson) {
  return [
    {
      test: /\.tsx?$/,
      exclude: [/node_modules/],
      use: {
        loader: 'ts-loader',
        options: {
          configFile: pathToTsconfigJson,
        },
      },
    },
    {
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    },
    {
      test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
      exclude: /node_modules/,
      use: ['file-loader?name=[name].[ext]'],
    },
    {
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    },
  ];
};
exports.pluginsCommon = [new dotenv_webpack_1.default()];
exports.webpackConfigCommonMaker = function (pathToTsconfigJson) {
  return {
    resolve: {
      extensions: ['.ts', '.js', '.tsx', '.jsx'],
    },
    module: { rules: rulesMaker(pathToTsconfigJson) },
  };
};
