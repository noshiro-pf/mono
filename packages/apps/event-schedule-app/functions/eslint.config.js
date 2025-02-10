/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import { eslintFlatConfigForTypeScript } from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/mono-utils';
import * as nodePath from 'node:path';

const thisDir = toThisDir(import.meta.url);

/** @returns {readonly FlatConfig[]} */
const defineConfig = () => [
  ...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [nodePath.resolve(thisDir, '../../../..'), thisDir],
  }),
];

export default defineConfig();
