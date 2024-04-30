/** @typedef {import('@noshiro/eslint-utils').FlatConfig} FlatConfig */

import { eslintFlatConfigCommon } from '@noshiro/eslint-utils';
import { toThisDir } from '@noshiro/mono-scripts';
import * as nodePath from 'node:path';

const thisDir = toThisDir(import.meta.url);

/** @type {readonly FlatConfig[]} */
const config = eslintFlatConfigCommon({
  tsconfigRootDir: thisDir,
  tsconfigFileName: './tsconfig.json',
  packageDirs: [nodePath.resolve(thisDir, '../../..'), thisDir],
});

export default config;
