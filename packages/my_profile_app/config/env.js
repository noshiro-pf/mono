'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.dotenvValues = void 0;
var tslib_1 = require('tslib');
var dotenv_1 = tslib_1.__importDefault(require('dotenv'));
var app_directory_1 = require('./app_directory');
var dotenvConfigOutput = dotenv_1.default.config({
  path: app_directory_1.resolveAppPath('.env'),
});
var dotenvParsed = dotenvConfigOutput.parsed;
exports.dotenvValues = {
  USE_BUNDLE_ANALYZER:
    (dotenvParsed === null || dotenvParsed === void 0
      ? void 0
      : dotenvParsed.USE_BUNDLE_ANALYZER) === 'true',
  HOST:
    dotenvParsed === null || dotenvParsed === void 0
      ? void 0
      : dotenvParsed.HOST,
  PORT:
    (dotenvParsed === null || dotenvParsed === void 0
      ? void 0
      : dotenvParsed.PORT) === undefined
      ? undefined
      : Number(dotenvParsed.PORT),
  PUBLIC_URL:
    dotenvParsed === null || dotenvParsed === void 0
      ? void 0
      : dotenvParsed.PUBLIC_URL,
};
