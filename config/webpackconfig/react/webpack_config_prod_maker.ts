import CompressionPlugin from 'compression-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import type webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import 'webpack-dev-server';
import { merge } from 'webpack-merge';
import type { Paths } from './paths_type';
import {
  pluginsCommon,
  webpackConfigReactCommonMaker,
} from './webpack_config_common_maker';

const plugins: webpack.WebpackPluginInstance[] = [
  ...pluginsCommon,
  new CompressionPlugin({
    test: /\.(css)|(js)$/u,
    compressionOptions: {
      level: 9,
    },
  }),
];

export const webpackConfigReactProdMaker = (
  paths: Paths,
  bundleJsName: string,
  useBundleAnalyzer: boolean = false
): webpack.Configuration =>
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
