/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/ban-ts-comment */

/** @typedef {import('../src/types/flat-config.mjs').FlatConfig} FlatConfig */

import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import functional from 'eslint-plugin-functional';

const thisDir = import.meta.dirname;

/** @type {readonly FlatConfig[]} */
const config = [
  {
    ignores: ['esm/**', 'scripts/**'],
  },
  {
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: 'tsconfig.gen.json',
        tsconfigRootDir: thisDir,
      },
    },
    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      functional,
    },
  },
  {
    files: ['src/types/rules/*.mts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/sort-type-constituents': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'error',

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
