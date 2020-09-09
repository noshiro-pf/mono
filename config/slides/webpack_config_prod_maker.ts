import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import 'webpack-dev-server';
import { merge } from 'webpack-merge';
import { Paths } from './paths_type';
import { webpackConfigSlidesCommonMaker } from './webpack_config_common_maker';

export const webpackConfigSlidesProdMaker = (
  paths: Paths,
  bundlejsName: string,
  copyPaths: { from: string; to: string }[],
  useBundleAnalyzer: boolean = false
): webpack.Configuration =>
  merge(
    webpackConfigSlidesCommonMaker(paths, copyPaths, false, useBundleAnalyzer),
    {
      mode: 'production',
      output: {
        path: paths.appBuild,
        publicPath: paths.publicUrlOrPath,
        filename: bundlejsName,
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
