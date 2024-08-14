import globals from 'globals';
import { eslintJestRules } from '../rules/index.mjs';
import { type FlatConfig } from '../types/index.mjs';

export const eslintFlatConfigForJest = (): FlatConfig =>
  ({
    languageOptions: {
      // https://github.com/sindresorhus/globals/blob/main/globals.json
      globals: {
        ...globals.es2021,
        ...globals.browser,
        ...globals.node,
        // using jest/prefer-importing-jest-globals
        // ...globals.jest,
      },
    },
    rules: {
      ...eslintJestRules,
    },
  }) as const satisfies FlatConfig;
