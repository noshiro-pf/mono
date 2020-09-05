import * as webpack from 'webpack';
import 'webpack-dev-server';
import WebpackDevServer from 'webpack-dev-server';
import { merge } from 'webpack-merge';
import { Paths } from './paths_type';
import {
  pluginsCommon,
  webpackConfigReactCommonMaker,
} from './webpack_config_common_maker';

const devServerConfigMaker = (
  paths: Paths,
  host: string,
  port: number
): WebpackDevServer.Configuration => ({
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

const plugins: webpack.Plugin[] = [
  ...pluginsCommon,
  new webpack.HotModuleReplacementPlugin(),
];

export const webpackConfigReactDevMaker = (
  paths: Paths,
  host: string,
  port: number,
  bundlejsName: string
): webpack.Configuration =>
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
      filename: bundlejsName,
    },
    devServer: devServerConfigMaker(paths, host, port),
    devtool: 'inline-source-map',
    plugins,
  });
