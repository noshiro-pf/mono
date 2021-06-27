import copyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import 'webpack-dev-server';
import type { Paths } from './paths_type';

const rulesMaker = (): webpack.RuleSetRule[] => [
  {
    test: /\.js$/u,
    exclude: /node_modules/u,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', { modules: false }]],
        },
      },
    ],
  },
  {
    test: /\.(ttf|woff|eot)$/u,
    loader: 'file-loader',
    options: {
      name: '[name].[ext]?[hash]',
    },
  },
  {
    test: /\.css$/u,
    use: ['style-loader', 'css-loader'],
  },
];

const pluginsMaker = (
  templatePath: string,
  copyPaths: readonly Readonly<{ from: string; to: string }>[],
  hot: boolean,
  useBundleAnalyzer: boolean
): webpack.WebpackPluginInstance[] =>
  [
    new copyWebpackPlugin({ patterns: copyPaths }),
    new HtmlWebpackPlugin({ template: templatePath }),
  ]
    .concat(hot ? [new webpack.HotModuleReplacementPlugin()] : [])
    .concat(useBundleAnalyzer ? [new BundleAnalyzerPlugin()] : []);

export const webpackConfigSlidesCommonMaker = (
  paths: Paths,
  copyPaths: readonly Readonly<{ from: string; to: string }>[],
  hot: boolean,
  useBundleAnalyzer: boolean
): webpack.Configuration => ({
  entry: [paths.appIndexJs],
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: { rules: rulesMaker() },
  plugins: pluginsMaker(paths.template, copyPaths, hot, useBundleAnalyzer),
});
