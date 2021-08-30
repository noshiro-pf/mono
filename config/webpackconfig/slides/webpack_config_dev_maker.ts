import type webpack from 'webpack';
import 'webpack-dev-server';
import type { Configuration } from 'webpack-dev-server';
import { merge } from 'webpack-merge';
import type { Paths } from './paths_type';
import { webpackConfigSlidesCommonMaker } from './webpack_config_common_maker';

const devServerConfigMaker = (
  paths: Paths,
  host: string,
  port: number
): Configuration => ({
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

export const webpackConfigSlidesDevMaker = (
  paths: Paths,
  host: string,
  port: number,
  bundleJsName: string,
  copyPaths: readonly Readonly<{ from: string; to: string }>[]
): webpack.Configuration =>
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
