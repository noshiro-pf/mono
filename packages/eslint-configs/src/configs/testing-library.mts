import globals from 'globals';
import { eslintTestingLibraryRules } from '../rules/index.mjs';
import { type FlatConfig } from '../types/index.mjs';

export const eslintFlatConfigForTestingLibrary = (): FlatConfig =>
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
      ...eslintTestingLibraryRules,
    },
  }) as const satisfies FlatConfig;
