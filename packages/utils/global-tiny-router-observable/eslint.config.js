/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import { eslintFlatConfigForTypeScript } from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/mono-utils';
import * as path from 'node:path';

const thisDir = toThisDir(import.meta.url);

/** @type {readonly FlatConfig[]} */
const config = eslintFlatConfigForTypeScript({
  tsconfigRootDir: thisDir,
  tsconfigFileName: './tsconfig.json',
  packageDirs: [path.resolve(thisDir, '../../..'), thisDir],
});

export default config;
