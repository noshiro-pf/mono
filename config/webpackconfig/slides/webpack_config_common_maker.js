'use strict';

// @ts-check

/** @typedef { import("webpack").RuleSetRule } RuleSetRule */
/** @typedef { import("webpack").WebpackPluginInstance } WebpackPluginInstance */
/** @typedef { import("webpack").Configuration } Configuration */
/** @typedef { import("../../types/slides-paths").SlidesPaths } SlidesPaths */

const copyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

require('webpack-dev-server');

/**
 * @returns {RuleSetRule[]}
 */
const rulesMaker = () => [
  {
    test: /\.js$/u,
    exclude: /node_modules/u,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', { modules: false }]],
        },
      },
    ],
  },
  {
    test: /\.(ttf|woff|eot)$/u,
    loader: 'file-loader',
    options: {
      name: '[name].[ext]?[hash]',
    },
  },
  {
    test: /\.css$/u,
    use: ['style-loader', 'css-loader'],
  },
];

/**
 *
 * @param {string} templatePath
 * @param {{ from: string; to: string }[]} copyPaths
 * @param {boolean} hot
 * @param {boolean} useBundleAnalyzer
 * @returns {WebpackPluginInstance[]}
 */
const pluginsMaker = (templatePath, copyPaths, hot, useBundleAnalyzer) =>
  [
    new copyWebpackPlugin({ patterns: copyPaths }),
    new HtmlWebpackPlugin({ template: templatePath }),
  ]
    .concat(hot ? [new HotModuleReplacementPlugin()] : [])
    .concat(useBundleAnalyzer ? [new BundleAnalyzerPlugin()] : []);

/**
 *
 * @param {SlidesPaths} paths
 * @param {{ from: string; to: string }[]} copyPaths
 * @param {boolean} hot
 * @param {boolean} useBundleAnalyzer
 * @returns {Configuration}
 */
const webpackConfigSlidesCommonMaker = (
  paths,
  copyPaths,
  hot,
  useBundleAnalyzer
) => ({
  entry: [paths.appIndexJs],
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: { rules: rulesMaker() },
  plugins: pluginsMaker(paths.template, copyPaths, hot, useBundleAnalyzer),
});

module.exports = { webpackConfigSlidesCommonMaker };
