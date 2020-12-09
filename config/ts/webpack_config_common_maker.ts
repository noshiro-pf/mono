import { Configuration, RuleSetRule } from 'webpack';
import 'webpack-dev-server';
// import { absolutePathFromMonoRoot } from '../../scripts/get_mono_root_path';

export const rulesMakerCommon = (pathToTsconfigJson: string): RuleSetRule[] => [
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
  {
    test: /\.(txt|md)$/,
    use: {
      loader: 'raw-loader',
    },
  },
];

export const webpackConfigCommonMaker = (
  pathToTsconfigJson: string,
  entry: string,
  outputPath: string,
  bundleJsName: string
): Configuration => ({
  mode: 'production',
  // stats: 'verbose',
  entry,
  output: {
    filename: bundleJsName,
    path: outputPath,
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    // symlinks: false,
  },
  module: { rules: rulesMakerCommon(pathToTsconfigJson) },
  // target: 'node',
  optimization: {
    runtimeChunk: true,
  },
});
