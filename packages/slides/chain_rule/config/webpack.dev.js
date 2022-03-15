'use strict';

// @ts-check

/** @typedef { import("webpack").Configuration } Configuration */

const {
  webpackConfigSlidesDevMaker,
} = require('../../../../config/webpackconfig/slides/webpack_config_prod_maker');
const { dotenvValues } = require('./env');
const { copyPaths } = require('./copy_paths');
const { paths } = require('./paths');

require('webpack-dev-server');

console.log('use bundle analyzer: ', dotenvValues.USE_BUNDLE_ANALYZER);

/** @type {Configuration} */
const config = webpackConfigSlidesDevMaker(
  paths,
  dotenvValues.HOST ?? 'localhost',
  Number(dotenvValues.PORT ?? 8080),
  'main.js',
  copyPaths
);

module.exports = config;
