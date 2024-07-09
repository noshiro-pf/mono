/** @typedef {import('@noshiro/eslint-utils').FlatConfig} FlatConfig */

import { eslintFlatConfigCommon } from '@noshiro/eslint-utils';
import { toThisDir } from '@noshiro/mono-scripts';
import * as nodePath from 'node:path';

const thisDir = toThisDir(import.meta.url);

/** @returns {Promise<readonly FlatConfig[]>} */
const defineConfig = async () => {
  /** @type {readonly FlatConfig[]} */
  const configs = [
    ...eslintFlatConfigCommon({
      tsconfigRootDir: thisDir,
      tsconfigFileName: './tsconfig.json',
      packageDirs: [nodePath.resolve(thisDir, '../../..'), thisDir],
    }),
    {
      rules: {
        '@typescript-eslint/class-methods-use-this': 'off',
      },
    },
  ];

  return configs;
};

export default defineConfig();
