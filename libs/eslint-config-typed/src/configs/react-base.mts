import globals from 'globals';
import {
  eslintJsxA11yRules,
  eslintReactHooksRules,
  eslintReactPerfRules,
  eslintReactRefreshRules,
  eslintReactRules,
  restrictedGlobalsForFrontend,
} from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';

export const eslintFlatConfigForReactBase = (
  files?: readonly string[],
): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      // https://github.com/sindresorhus/globals/blob/main/globals.json
      globals: {
        ...globals.browser,
      },
      sourceType: 'module',
    },
    rules: defineKnownRules({
      ...eslintReactRules,
      ...eslintReactHooksRules,
      ...eslintReactRefreshRules,
      ...eslintJsxA11yRules,
      ...eslintReactPerfRules,
      'no-restricted-globals': ['error', ...restrictedGlobalsForFrontend],
    }),
  }) as const;
