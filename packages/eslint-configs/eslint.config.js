/** @typedef {import('./src/types/flat-config.mjs').FlatConfig} FlatConfig */

import * as nodePath from 'node:path';
import { eslintFlatConfigForTypeScript } from './esm/configs/typescript.mjs';

const thisDir = import.meta.dirname;

/** @type {readonly FlatConfig[]} */
const config = [
  {
    ignores: ['esm/**', 'scripts/**/*.mjs'],
  },
  ...eslintFlatConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [nodePath.resolve(thisDir, '../..'), thisDir],
  }),
  {
    files: ['**/*.mts'],
    rules: {
      'no-restricted-globals': 'off',
      'import/no-internal-modules': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
  },
  {
    files: ['scripts/**/*.mts'],
    rules: {
      'no-await-in-loop': 'off',
    },
  },
  {
    files: ['src/types/rules/*.mts'],
    rules: {
      // TODO
      // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/prefer-readonly-type.md
      'functional/prefer-readonly-type': [
        'warn',
        {
          ignoreCollections: false,
          ignoreClass: 'fieldsOnly',
          // allowMutableReturnType: true,
          // ignorePattern: [],
        },
      ],
      'functional/readonly-type': ['error', 'keyword'],
    },
  },
];

export default config;
