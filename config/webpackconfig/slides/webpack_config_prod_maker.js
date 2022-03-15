'use strict';

// @ts-check

/** @typedef { import("webpack").WebpackPluginInstance } WebpackPluginInstance */
/** @typedef { import("webpack").Configuration } Configuration */
/** @typedef { import("../../types/slides_paths").SlidesPaths } Paths */

const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');
const {
  webpackConfigSlidesCommonMaker,
} = require('./webpack_config_common_maker');

require('webpack-dev-server');

/**
 *
 * @param {Paths} paths
 * @param {string} bundleJsName
 * @param {{ from: string; to: string }[]} copyPaths
 * @param {boolean} useBundleAnalyzer
 * @returns {Configuration}
 */
const webpackConfigSlidesProdMaker = (
  paths,
  bundleJsName,
  copyPaths,
  useBundleAnalyzer = false
) =>
  merge(
    webpackConfigSlidesCommonMaker(paths, copyPaths, false, useBundleAnalyzer),
    {
      mode: 'production',
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
    }
  );

module.exports = { webpackConfigSlidesProdMaker };
