'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.resolveAppPath = void 0;
var tslib_1 = require('tslib');
var fs = tslib_1.__importStar(require('fs'));
var path_resolver_maker_1 = require('../../../scripts/path_resolver_maker');
// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
var appDirectory = fs.realpathSync(process.cwd());
exports.resolveAppPath = path_resolver_maker_1.pathResolverMaker(appDirectory);
