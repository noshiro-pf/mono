'use strict';

// @ts-check

/** @typedef { import("webpack").RuleSetRule } RuleSetRule */
/** @typedef { import("webpack").Configuration } Configuration */

require('webpack-dev-server');

/**
 * @param {string} pathToTsconfigJson
 * @returns {RuleSetRule[]}
 */
const rulesMakerCommon = (pathToTsconfigJson) => [
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

  /**
   * https://www.wantedly.com/companies/wantedly/post_articles/408339
   * https://webpack.js.org/loaders/babel-loader/
   */
  {
    test: /\.m?js$/,
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
        plugins: [
          [
            '@babel/plugin-polyfill-corejs3',
            {
              // entry-global, usage-global, usage-pure のいずれかを指定
              method: 'usage-pure',
              // core-jsのバージョン情報を与えると、より最適な結果を出してくれる
              version: '^3.27.1',
            },
          ],
          '@babel/plugin-transform-runtime',
        ],
      },
    },
  },

  {
    test: /\.(txt|md)$/u,
    use: {
      loader: 'raw-loader',
    },
  },
];

/**
 *
 * @param {string} pathToTsconfigJson
 * @param {string} entry
 * @param {string} outputPath
 * @param {string} bundleJsName
 * @returns {Configuration}
 */
const webpackConfigCommonMaker = (
  pathToTsconfigJson,
  entry,
  outputPath,
  bundleJsName
) => ({
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
  ignoreWarnings: [/Failed to parse source map/],
});

module.exports = {
  rulesMakerCommon,
  webpackConfigCommonMaker,
};
