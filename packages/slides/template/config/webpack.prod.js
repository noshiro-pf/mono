'use strict';

// @ts-check

/** @typedef { import("webpack").Configuration } Configuration */

const {
  webpackConfigSlidesProdMaker,
} = require('../../../../config/webpackconfig/slides/webpack_config_prod_maker');
const { dotenvValues } = require('./env');
const { copyPaths } = require('./copy_paths');
const { paths } = require('./paths');

console.log('use bundle analyzer: ', dotenvValues.USE_BUNDLE_ANALYZER);

/** @type {Configuration} */
const config = webpackConfigSlidesProdMaker(
  paths,
  'main.js',
  copyPaths,
  dotenvValues.USE_BUNDLE_ANALYZER
);

module.exports = config;
