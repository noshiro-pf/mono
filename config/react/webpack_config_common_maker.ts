import DotenvPlugin from 'dotenv-webpack';
import * as webpack from 'webpack';
import 'webpack-dev-server';

const rulesMaker = (pathToTsconfigJson: string): webpack.RuleSetRule[] => [
  {
    test: /\.tsx?$/,
    exclude: [/node_modules/],
    use: {
      loader: 'ts-loader',
      options: {
        configFile: pathToTsconfigJson,
      },
    },
  },
  {
    test: /\.css$/i,
    use: ['style-loader', 'css-loader'],
  },
  {
    test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
    exclude: /node_modules/,
    use: ['file-loader?name=[name].[ext]'], // ?name=[name].[ext] is only necessary to preserve the original file name
  },
  {
    test: /\.js$/,
    enforce: 'pre',
    use: ['source-map-loader'],
  },
];

export const pluginsCommon: webpack.Plugin[] = [new DotenvPlugin()];

export const webpackConfigCommonMaker = (
  pathToTsconfigJson: string
): webpack.Configuration => ({
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
  },
  module: { rules: rulesMaker(pathToTsconfigJson) },
});
