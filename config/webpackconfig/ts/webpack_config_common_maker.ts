import type { Configuration, RuleSetRule } from 'webpack';
import 'webpack-dev-server';

export const rulesMakerCommon = (pathToTsconfigJson: string): RuleSetRule[] => [
  {
    test: /\.tsx?$/u,
    exclude: [/node_modules/u],
    use: {
      loader: 'ts-loader',
      options: {
        configFile: pathToTsconfigJson,
        onlyCompileBundledFiles: true,
      },
    },
  },
  {
    test: /\.js$/u,
    enforce: 'pre',
    use: ['source-map-loader'],
  },
  {
    test: /\.(txt|md)$/u,
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
    mainFields: ['modules', 'main'],
  },
  module: { rules: rulesMakerCommon(pathToTsconfigJson) },
  // target: 'node',
  optimization: {
    runtimeChunk: true,
  },
});
