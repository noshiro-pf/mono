/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import { eslintFlatConfigForTypeScript } from '@noshiro/eslint-configs';
import * as path from 'node:path';

const thisDir = import.meta.dirname;

/** @type {readonly FlatConfig[]} */
const config = eslintFlatConfigForTypeScript({
  tsconfigRootDir: thisDir,
  tsconfigFileName: './tsconfig.json',
  packageDirs: [path.resolve(thisDir, '../../..'), thisDir],
});

export default config;
