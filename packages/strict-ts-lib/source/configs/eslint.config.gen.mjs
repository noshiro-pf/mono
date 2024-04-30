/** @typedef {import('@noshiro/eslint-utils').FlatConfig} FlatConfig */

import { toThisDir } from '@noshiro/mono-scripts';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import functional from 'eslint-plugin-functional';

const thisDir = toThisDir(import.meta.url);

/** @returns {readonly FlatConfig[]} */
const defineConfig = () => [
  {
    ignores: ['eslint.config.js', 'eslint.config.*.mjs'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      parser: typescriptEslintParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: thisDir,
        ecmaVersion: 'latest',
        ecmaFeatures: {
          modules: true,
          impliedStrict: true,
          jsx: true,
        },
        jsxPragma: null, // for @typescript/eslint-parser
        sourceType: 'module',
      },
    },
    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      // @ts-expect-error FIXME
      '@typescript-eslint': typescriptEslint,
      // @ts-expect-error FIXME
      functional,
    },
  },
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
    },
  },
  {
    files: [
      'eslint-fixed/**/!(lib.dom|lib.webworker).d.ts',
      'final/**/!(lib.dom|lib.webworker).d.ts',
    ],

    rules: {
      // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/prefer-readonly-type.md
      'functional/prefer-readonly-type': [
        'error',
        {
          checkImplicit: false,
          ignoreInterface: false,
          ignoreCollections: false,
          ignoreClass: 'fieldsOnly',
          allowMutableReturnType: false,
          allowLocalMutation: false,
          ignorePattern: [],
        },
      ],
    },
  },
];

export default defineConfig();
