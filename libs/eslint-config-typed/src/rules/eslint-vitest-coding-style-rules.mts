import { type EslintVitestCodingStyleRules } from '../types/index.mjs';

export const eslintVitestCodingStyleRules = {
  'vitest-coding-style/no-expect-to-strict-equal': 'error',
} as const satisfies EslintVitestCodingStyleRules;
