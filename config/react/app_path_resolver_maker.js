"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appPathResolverMaker = void 0;
var tslib_1 = require("tslib");
var path = tslib_1.__importStar(require("path"));
exports.appPathResolverMaker = function (appDirectory) { return function (relativePath, endsWithSlash) {
    if (endsWithSlash === void 0) { endsWithSlash = false; }
    return path.resolve(appDirectory, relativePath) + (endsWithSlash ? '/' : '');
}; };
