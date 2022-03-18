'use strict';

// @ts-check

/** @typedef { import("webpack").WebpackPluginInstance } WebpackPluginInstance */
/** @typedef { import("webpack").Configuration } Configuration */
/** @typedef { import("webpack").Configuration["devServer"] } WebpackDevServerConfiguration */
/** @typedef { import("../../types/paths").Paths } Paths */

const { merge } = require('webpack-merge');
const { HotModuleReplacementPlugin } = require('webpack');
const {
  pluginsCommon,
  webpackConfigReactCommonMaker,
} = require('./webpack_config_common_maker');

require('webpack-dev-server');

/**
 *
 * @param {Paths} paths
 * @param {string} host
 * @param {number} port
 * @returns {WebpackDevServerConfiguration}
 */
const devServerConfigMaker = (paths, host, port) => ({
  open: false,
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

/** @type {WebpackPluginInstance[]} */
const plugins = [...pluginsCommon, new HotModuleReplacementPlugin()];

/**
 *
 * @param {Paths} paths
 * @param {string} host
 * @param {number} port
 * @param {string} bundleJsName
 * @returns {Configuration}
 */
const webpackConfigReactDevMaker = (paths, host, port, bundleJsName) =>
  merge(webpackConfigReactCommonMaker(paths.tsconfigJson), {
    mode: 'development',
    entry: [
      `webpack-dev-server/client?http://localhost:${port}`,
      'webpack/hot/dev-server',
      paths.appIndexJs,
    ],
    output: {
      publicPath: paths.publicUrlOrPath,
      pathinfo: true,
      filename: bundleJsName,
    },
    devServer: devServerConfigMaker(paths, host, port),
    devtool: 'inline-source-map',
    plugins,
  });

module.exports = { webpackConfigReactDevMaker };
