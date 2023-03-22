// @ts-check

import { resolve } from 'node:path';

/**
 * @param {string} rootDir
 */
export const pathResolverMaker =
  (rootDir) =>
  /**
   * @param {string} relativePath
   * @param {boolean} endsWithSlash
   * @returns {string}
   */
  (relativePath, endsWithSlash = false) =>
    resolve(rootDir, relativePath) + (endsWithSlash ? '/' : '');
