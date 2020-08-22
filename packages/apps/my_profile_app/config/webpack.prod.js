'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
require('webpack-dev-server');
var webpack_config_prod_maker_1 = require('../../../config/react/webpack_config_prod_maker');
var env_1 = require('./env');
var paths_1 = require('./paths');
console.log('use bundle analyzer: ', env_1.dotenvValues.USE_BUNDLE_ANALYZER);
var webpackConfigMerged = webpack_config_prod_maker_1.webpackConfigProdMaker(
  paths_1.paths,
  'bundle.js',
  env_1.dotenvValues.USE_BUNDLE_ANALYZER
);
exports.default = webpackConfigMerged;
