import DotenvPlugin from 'dotenv-webpack';
import type webpack from 'webpack';
import 'webpack-dev-server';
import { rulesMakerCommon } from '../ts';

const rulesMaker = (pathToTsconfigJson: string): webpack.RuleSetRule[] => [
  ...rulesMakerCommon(pathToTsconfigJson),
  {
    test: /\.css$/iu,
    use: ['style-loader', 'css-loader'],
  },
  {
    test: /\.(png|svg|jpg|jpeg|gif|ico)$/u,
    exclude: /node_modules/u,
    use: ['file-loader?name=[name].[ext]'], // ?name=[name].[ext] is only necessary to preserve the original file name
  },
  {
    test: /\.(ttf|eot|svg)$/u,
    use: {
      loader: 'file-loader',
      options: {
        name: 'fonts/[hash].[ext]',
      },
    },
  },
  {
    test: /\.(woff|woff2)$/u,
    use: {
      loader: 'url-loader',
      options: {
        name: 'fonts/[hash].[ext]',
        limit: 5000,
        mimetype: 'application/font-woff',
      },
    },
  },
];

export const pluginsCommon: webpack.WebpackPluginInstance[] = [
  new DotenvPlugin(),
];

export const webpackConfigReactCommonMaker = (
  pathToTsconfigJson: string
): webpack.Configuration => ({
  resolve: {
    // symlinks: false,
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
  },
  module: { rules: rulesMaker(pathToTsconfigJson) },
});
