'use strict';
var _a, _b;
Object.defineProperty(exports, '__esModule', { value: true });
require('webpack-dev-server');
var webpack_config_dev_maker_1 = require('../../../config/react/webpack_config_dev_maker');
var env_1 = require('./env');
var paths_1 = require('./paths');
var webpackConfigMerged = webpack_config_dev_maker_1.webpackConfigDevExtensionMaker(
  paths_1.paths,
  (_a = env_1.dotenvValues.HOST) !== null && _a !== void 0 ? _a : 'localhost',
  Number((_b = env_1.dotenvValues.PORT) !== null && _b !== void 0 ? _b : 3000),
  'bundle.js'
);
exports.default = webpackConfigMerged;
