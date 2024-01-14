/** @typedef { import('@noshiro/eslint-utils').FlatConfig } FlatConfig */

import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';
import * as nodePath from 'node:path';
import { eslintFlatConfigCommonWithRules } from '../../../config/eslint/flat-configs/common-with-rules.mjs';

const thisDir = toThisDir(import.meta.url);

/** @returns {Promise<readonly FlatConfig[]>} */
const defineConfig = async () => {
  /** @type {FlatConfig} */
  const config = {
    files: ['src/**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: thisDir,
      },
    },
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          packageDir: [nodePath.resolve(thisDir, '../../..'), thisDir],
        },
      ],

      'import/no-internal-modules': 'off',
      'import/no-cycle': 'off',
    },
  };

  return [...eslintFlatConfigCommonWithRules, config];
};

export default defineConfig();
