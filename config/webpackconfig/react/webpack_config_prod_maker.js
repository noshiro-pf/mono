'use strict';

// @ts-check

/** @typedef { import("webpack").WebpackPluginInstance } WebpackPluginInstance */
/** @typedef { import("webpack").Configuration } Configuration */
/** @typedef { import("../../types/paths").Paths } Paths */

const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { merge } = require('webpack-merge');
const {
  pluginsCommon,
  webpackConfigReactCommonMaker,
} = require('./webpack_config_common_maker');

require('webpack-dev-server');

/** @type {WebpackPluginInstance[]} */
const plugins = [
  ...pluginsCommon,
  new CompressionPlugin({
    test: /\.(css)|(js)$/u,
    compressionOptions: {
      level: 9,
    },
  }),
];

/**
 *
 * @param {Paths} paths
 * @param {string} bundleJsName
 * @param {boolean} useBundleAnalyzer
 * @returns {Configuration}
 */
const webpackConfigReactProdMaker = (
  paths,
  bundleJsName,
  useBundleAnalyzer = false
) =>
  merge(webpackConfigReactCommonMaker(paths.tsconfigJson), {
    mode: 'production',
    entry: [paths.appIndexJs],
    output: {
      path: paths.appBuild,
      publicPath: paths.publicUrlOrPath,
      filename: bundleJsName,
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: 'all',
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    },
    devtool: 'source-map',
    plugins: useBundleAnalyzer
      ? [...plugins, new BundleAnalyzerPlugin()]
      : plugins,
  });

module.exports = { webpackConfigReactProdMaker };
