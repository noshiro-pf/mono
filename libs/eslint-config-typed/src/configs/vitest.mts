// import vitest from 'eslint-plugin-vitest';
import { eslintVitestRules } from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';

export const eslintFlatConfigForVitest = (
  files?: readonly string[],
): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),
    languageOptions: {
      // https://github.com/sindresorhus/globals/blob/main/globals.json
      globals: {
        // ...vitest.environments.env.globals,
      },
    },
    rules: defineKnownRules({
      ...eslintVitestRules,
    }),
  }) as const satisfies FlatConfig;
