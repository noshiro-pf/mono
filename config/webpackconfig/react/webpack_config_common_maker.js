'use strict';

// @ts-check

/** @typedef { import("webpack").RuleSetRule } RuleSetRule */
/** @typedef { import("webpack").WebpackPluginInstance } WebpackPluginInstance */
/** @typedef { import("webpack").Configuration } Configuration */

const DotenvPlugin = require('dotenv-webpack');
const { rulesMakerCommon } = require('../ts');
require('webpack-dev-server');

/**
 * @param {string} pathToTsconfigJson
 * @returns {RuleSetRule[]}
 */
const rulesMaker = (pathToTsconfigJson) => [
  ...rulesMakerCommon(pathToTsconfigJson),
  {
    test: /\.css$/iu,
    use: ['style-loader', 'css-loader'],
  },
  {
    test: /\.(png|svg|jpg|jpeg|gif|ico)$/u,
    exclude: /node_modules/u,
    use: ['file-loader?name=[name].[ext]'], // ?name=[name].[ext] is only necessary to preserve the original file name
  },
  {
    test: /\.(ttf|eot|svg)$/u,
    use: {
      loader: 'file-loader',
      options: {
        name: 'fonts/[hash].[ext]',
      },
    },
  },
  {
    test: /\.(woff|woff2)$/u,
    use: {
      loader: 'url-loader',
      options: {
        name: 'fonts/[hash].[ext]',
        limit: 5000,
        mimetype: 'application/font-woff',
      },
    },
  },
];

/** @type {WebpackPluginInstance[]} */
const pluginsCommon = [new DotenvPlugin()];

/**
 *
 * @param {string} pathToTsconfigJson
 * @returns {Configuration}
 */
const webpackConfigReactCommonMaker = (pathToTsconfigJson) => ({
  resolve: {
    // symlinks: false,
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
  },
  module: { rules: rulesMaker(pathToTsconfigJson) },
  ignoreWarnings: [/Failed to parse source map/],
});

module.exports = { pluginsCommon, webpackConfigReactCommonMaker };
