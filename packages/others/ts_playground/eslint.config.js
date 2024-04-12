/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import { eslintConfigForTypeScript } from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/mono-scripts';
import * as nodePath from 'node:path';

const thisDir = toThisDir(import.meta.url);

/** @returns {Promise<readonly FlatConfig[]>} */
const defineConfig = async () => {
  /** @type {readonly FlatConfig[]} */
  const configs = [
    ...eslintConfigForTypeScript({
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
