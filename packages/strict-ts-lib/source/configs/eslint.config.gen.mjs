/** @typedef {import('@noshiro/eslint-utils').FlatConfig} FlatConfig */

import { eslintFlatConfigCommonWithoutRules } from '@noshiro/eslint-utils';
import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';

const thisDir = toThisDir(import.meta.url);

/** @returns {readonly FlatConfig[]} */
const defineConfig = () => [
  ...eslintFlatConfigCommonWithoutRules({
    tsconfigFileName: './tsconfig.eslint.json',
    tsconfigRootDir: thisDir,
  }),
  {
    files: ['eslint-fixed/**/*.d.ts', 'final/**/*.d.ts'],

    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          fixToUnknown: true,
          ignoreRestArgs: true,
        },
      ],

      // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/prefer-readonly-type.md
      'functional/prefer-readonly-type': [
        'error',
        {
          ignoreCollections: false,
          ignoreClass: 'fieldsOnly',
          // allowMutableReturnType: true,
          // ignorePattern: [],
        },
      ],
    },
  },
];

export default defineConfig();
