/** @typedef { import('@noshiro/eslint-utils').FlatConfig } FlatConfig */

import { eslintFlatConfigForCypress } from '@noshiro/eslint-utils';
import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';
import * as nodePath from 'node:path';

/** @type {string} */
const thisDir = toThisDir(import.meta.url);

/** @type {readonly FlatConfig[]} */
const configs = eslintFlatConfigForCypress({
  packageDirs: [
    nodePath.resolve(thisDir, '../../../..'),
    nodePath.resolve(thisDir, '..'),
  ],
  tsconfigFileName: './tsconfig.json',
  tsconfigRootDir: thisDir,
});

export default configs;
