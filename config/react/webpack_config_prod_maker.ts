import CompressionPlugin from 'compression-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import * as webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import 'webpack-dev-server';
import { merge } from 'webpack-merge';
import { Paths } from './paths_type';
import {
  pluginsCommon,
  webpackConfigCommonMaker,
} from './webpack_config_common_maker';

const plugins: webpack.Plugin[] = [
  ...pluginsCommon,
  new CompressionPlugin({
    test: /\.(css)|(js)$/,
    compressionOptions: {
      level: 9,
    },
  }),
];

export const webpackConfigProdMaker = (
  paths: Paths,
  bundlejsName: string,
  use_bundle_analyzer: boolean = false
): webpack.Configuration =>
  merge(webpackConfigCommonMaker(paths.tsconfigJson), {
    mode: 'production',
    entry: [paths.appIndexJs],
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
    plugins: use_bundle_analyzer
      ? [...plugins, new BundleAnalyzerPlugin()]
      : plugins,
  });
