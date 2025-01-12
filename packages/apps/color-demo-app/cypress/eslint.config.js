/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import {
  eslintFlatConfigForCypress,
  eslintFlatConfigForTypeScript,
} from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/node-utils';
import * as nodePath from 'node:path';

/** @type {string} */
const thisDir = toThisDir(import.meta.url);

/** @type {readonly FlatConfig[]} */
const configs = [
  ...eslintFlatConfigForTypeScript({
    packageDirs: [
      nodePath.resolve(thisDir, '../../../..'),
      nodePath.resolve(thisDir, '..'),
    ],
    tsconfigFileName: './tsconfig.json',
    tsconfigRootDir: thisDir,
  }),
  eslintFlatConfigForCypress(),
];

export default configs;
