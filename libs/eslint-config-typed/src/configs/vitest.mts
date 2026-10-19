import {
  eslintVitestCodingStyleRules,
  eslintVitestRules,
} from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';

export const eslintConfigForVitest = (files?: readonly string[]): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),
    languageOptions: {
      // https://github.com/sindresorhus/globals/blob/main/globals.json
      globals: {
        // ...vitest.environments.env.globals,
      },
    },
    settings: {
      vitest: {
        // Lets the rules read types. Without it,
        // `vitest/prefer-describe-function-title` takes any import named as a
        // `describe` title for a function, a type-only one included, and
        // autofixes the string into a reference to it. Needs type-aware
        // linting, which `vitest/unbound-method` needs anyway.
        typecheck: true,
      },
    },
    rules: defineKnownRules({
      ...eslintVitestRules,
      ...eslintVitestCodingStyleRules,

      // vitest/unbound-method extends it and reports the same calls.
      '@typescript-eslint/unbound-method': 'off',
    }),
  }) as const;
