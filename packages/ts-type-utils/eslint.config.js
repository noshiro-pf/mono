/** @typedef {import('@noshiro/eslint-utils').FlatConfig} FlatConfig */

import { eslintFlatConfigCommon } from '@noshiro/eslint-utils';
import { toThisDir } from '@noshiro/mono-scripts';
import * as nodePath from 'node:path';

const thisDir = toThisDir(import.meta.url);

/** @returns {readonly FlatConfig[]} */
const defineConfig = () => [
  {
    ignores: ['std.d.mts', './src/**/*', 'ts-type-utils.d.mts'],
  },
  ...eslintFlatConfigCommon({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [nodePath.resolve(thisDir, '../..'), thisDir],
  }),
  {
    rules: {
      '@typescript-eslint/no-shadow': 'off',
    },
  },
];

export default defineConfig();
