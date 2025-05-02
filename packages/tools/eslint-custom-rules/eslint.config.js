/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import { eslintFlatConfigForTypeScript } from '@noshiro/eslint-configs';
import * as nodePath from 'node:path';

const thisDir = import.meta.dirname;

/** @returns {Promise<readonly FlatConfig[]>} */
const defineConfig = async () => {
  /** @type {readonly FlatConfig[]} */
  const configs = [
    ...eslintFlatConfigForTypeScript({
      tsconfigRootDir: thisDir,
      tsconfigFileName: './tsconfig.json',
      packageDirs: [nodePath.resolve(thisDir, '../../..'), thisDir],
    }),
    {
      files: ['src/**/*.ts'],
      rules: {
        'import/no-internal-modules': 'off',
        'import/no-cycle': 'off',
      },
    },
  ];

  return configs;
};

export default defineConfig();
