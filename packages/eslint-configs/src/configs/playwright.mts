import globals from 'globals';
import { eslintPlaywrightRules } from '../rules/eslint-playwright-rules.mjs';
import { type FlatConfig } from '../types/index.mjs';

export const eslintFlatConfigForPlaywright = (): FlatConfig =>
  ({
    languageOptions: {
      // https://github.com/sindresorhus/globals/blob/main/globals.json
      globals: {
        ...globals.es2021,
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...eslintPlaywrightRules,
      'jest/consistent-test-it': 'off',
      'vitest/consistent-test-it': 'off',
      'jest/expect-expect': 'off',
      'vitest/expect-expect': 'off',
      'jest/valid-describe-callback': 'off',
      'vitest/valid-describe-callback': 'off',
      'vitest/consistent-test-filename': 'off',
    },
  }) as const;
