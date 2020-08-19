import * as webpack from 'webpack';
import 'webpack-dev-server';
import nodeExternals from 'webpack-node-externals';

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
    test: /\.js$/,
    enforce: 'pre',
    use: ['source-map-loader'],
  },
];

export const webpackConfigCommonMaker = (
  entry: string,
  outputPath: string,
  pathToTsconfigJson: string
): webpack.Configuration => ({
  mode: 'production',
  entry,
  output: {
    filename: 'bundle.js',
    path: outputPath,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: { rules: rulesMaker(pathToTsconfigJson) },
  target: 'node',
  externals: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    nodeExternals({
      modulesFromFile: true,
    }),
  ],
});
