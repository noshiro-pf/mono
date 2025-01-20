import globals from 'globals';
import { eslintCypressRules } from '../rules/index.mjs';
import { type FlatConfig } from '../types/index.mjs';

export const eslintFlatConfigForCypress = (
  files?: readonly string[],
): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),
    languageOptions: {
      // https://github.com/sindresorhus/globals/blob/main/globals.json
      globals: {
        ...globals.es2021,
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...eslintCypressRules,
      'jest/consistent-test-it': 'off',
      'vitest/consistent-test-it': 'off',
      'jest/expect-expect': 'off',
      'vitest/expect-expect': 'off',
      'jest/valid-describe-callback': 'off',
      'vitest/valid-describe-callback': 'off',
    },
  }) as const;
