'use strict';
var _a;
Object.defineProperty(exports, '__esModule', { value: true });
exports.paths = void 0;
var app_directory_1 = require('./app_directory');
var env_1 = require('./env');
exports.paths = {
  appBuild: app_directory_1.resolveAppPath('build'),
  appIndexJs: app_directory_1.resolveAppPath('src/index.tsx'),
  publicUrlOrPath:
    (_a = env_1.dotenvValues.PUBLIC_URL) !== null && _a !== void 0 ? _a : '/',
  contentBase: app_directory_1.resolveAppPath('public', true),
  tsconfigJson: app_directory_1.resolveAppPath('tsconfig.json'),
};
