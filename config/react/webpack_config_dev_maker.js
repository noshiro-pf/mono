'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.webpackConfigDevExtensionMaker = void 0;
var tslib_1 = require('tslib');
var webpack = tslib_1.__importStar(require('webpack'));
require('webpack-dev-server');
var webpack_merge_1 = require('webpack-merge');
var webpack_config_common_maker_1 = require('./webpack_config_common_maker');
var devServerConfigMaker = function (paths, host, port) {
  return {
    open: true,
    host: host,
    port: port,
    publicPath: paths.publicUrlOrPath,
    contentBase: paths.contentBase,
    watchContentBase: true,
    compress: true,
    hot: true,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath,
    },
    quiet: true,
    overlay: true,
  };
};
var plugins = tslib_1.__spread(webpack_config_common_maker_1.pluginsCommon, [
  new webpack.HotModuleReplacementPlugin(),
]);
exports.webpackConfigDevExtensionMaker = function (
  paths,
  host,
  port,
  bundlejsName
) {
  return webpack_merge_1.merge(
    webpack_config_common_maker_1.webpackConfigCommonMaker(paths.tsconfigJson),
    {
      mode: 'development',
      entry: [
        'webpack-dev-server/client?http://localhost:' + port,
        'webpack/hot/dev-server',
        paths.appIndexJs,
      ],
      output: {
        publicPath: paths.publicUrlOrPath,
        pathinfo: true,
        filename: bundlejsName,
      },
      resolve: {
        extensions: ['.ts', '.js', '.tsx', '.jsx'],
      },
      devServer: devServerConfigMaker(paths, host, port),
      devtool: 'inline-source-map',
      plugins: plugins,
    }
  );
};
