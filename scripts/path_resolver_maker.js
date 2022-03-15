'use strict';

// @ts-check

const { resolve } = require('path');

/**
 * @param {string} rootDir
 */
const pathResolverMaker =
  (rootDir) =>
  /**
   * @param {string} relativePath
   * @param {boolean} endsWithSlash
   * @returns {string}
   */
  (relativePath, endsWithSlash = false) =>
    resolve(rootDir, relativePath) + (endsWithSlash ? '/' : '');

module.exports = { pathResolverMaker };
