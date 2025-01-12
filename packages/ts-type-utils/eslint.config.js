/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import { eslintFlatConfigForTypeScript } from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/node-utils';
import * as nodePath from 'node:path';

const thisDir = toThisDir(import.meta.url);

/** @returns {readonly FlatConfig[]} */
const defineConfig = () => [
  {
    ignores: ['std.d.mts', './src/**/*', 'ts-type-utils.d.mts'],
  },
  ...eslintFlatConfigForTypeScript({
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
