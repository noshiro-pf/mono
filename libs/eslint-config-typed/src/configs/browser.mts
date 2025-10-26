import globals from 'globals';
import { restrictedGlobalsForBrowser } from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';

export const eslintConfigForBrowser = (files?: readonly string[]): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),
    languageOptions: {
      // https://github.com/sindresorhus/globals/blob/main/globals.json
      globals: {
        ...globals.browser,
      },
      sourceType: 'module',
    },
    rules: defineKnownRules({
      'no-restricted-globals': ['error', ...restrictedGlobalsForBrowser],
      '@typescript-eslint/no-require-imports': 'off',
      'unicorn/no-new-buffer': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/prefer-json-parse-buffer': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-node-protocol': 'off',
    }),
  }) as const;
