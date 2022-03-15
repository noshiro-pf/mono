'use strict';

// @ts-check

/** @typedef { import("webpack").Configuration } Configuration */
/** @typedef { import("../../types/slides_paths").SlidesPaths } Paths */

const { merge } = require('webpack-merge');
const {
  webpackConfigSlidesCommonMaker,
} = require('./webpack_config_common_maker');

require('webpack-dev-server');

/**
 *
 * @param {Paths} paths
 * @param {string} host
 * @param {number} port
 * @returns {Configuration}
 */
const devServerConfigMaker = (paths, host, port) => ({
  open: true,
  host,
  port,
  publicPath: paths.publicUrlOrPath,
  contentBase: paths.contentBase,
  watchContentBase: true,
  compress: true,
  hot: true,
  historyApiFallback: {
    disableDotRule: true,
    index: paths.publicUrlOrPath,
  },
  overlay: true,
});

/**
 *
 * @param {Paths} paths
 * @param {string} host
 * @param {number} port
 * @param {string} bundleJsName
 * @param {{ from: string; to: string }[]} copyPaths
 * @returns {Configuration}
 */
const webpackConfigSlidesDevMaker = (
  paths,
  host,
  port,
  bundleJsName,
  copyPaths
) =>
  merge(webpackConfigSlidesCommonMaker(paths, copyPaths, true, false), {
    mode: 'development',
    output: {
      publicPath: paths.publicUrlOrPath,
      pathinfo: true,
      filename: bundleJsName,
    },
    devServer: devServerConfigMaker(paths, host, port),
    devtool: 'inline-source-map',
  });

module.exports = { webpackConfigSlidesDevMaker };
