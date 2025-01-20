import globals from 'globals';
import {
  eslintJsxA11yRules,
  eslintReactHooksRules,
  eslintReactRefreshRules,
  eslintReactRules,
  restrictedGlobalsForFrontend,
} from '../rules/index.mjs';
import { type EslintRules, type FlatConfig } from '../types/index.mjs';

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
    rules: {
      ...eslintReactRules,
      ...eslintReactHooksRules,
      ...eslintReactRefreshRules,
      ...eslintJsxA11yRules,

      'no-restricted-globals': [
        'error',
        ...restrictedGlobalsForFrontend,
      ] satisfies EslintRules['no-restricted-globals'],
    },
  }) as const;
