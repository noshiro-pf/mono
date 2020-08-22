'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var path = tslib_1.__importStar(require('path'));
var webpack_config_common_maker_1 = require('../../../../config/ts/webpack_config_common_maker');
var config = webpack_config_common_maker_1.webpackConfigCommonMaker(
  __dirname + '/../src/index.ts',
  path.resolve(process.cwd() + '/lib'),
  __dirname + '/tsconfig.lib.json'
);
exports.default = config;
