import * as nodePath from 'node:path';
import * as nodeUrl from 'node:url';

/**
 * @param {string} importMetaUrl
 * @returns {string}
 */
export const toThisDir = (importMetaUrl) =>
  nodePath.dirname(nodeUrl.fileURLToPath(importMetaUrl));
