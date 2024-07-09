/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import { eslintFlatConfigForCypress } from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/mono-scripts';
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
