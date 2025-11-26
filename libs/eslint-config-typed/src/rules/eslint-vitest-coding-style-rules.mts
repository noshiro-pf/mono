import { type EslintVitestCodingStyleRules } from '../types/index.mjs';

export const eslintVitestCodingStyleRules = {
  'vitest-coding-style/no-expect-to-strict-equal': 'error',
  'vitest-coding-style/prefer-assert-over-assert-ok': 'error',
  'vitest-coding-style/prefer-assert-not-ok-over-assert-is-not-ok': 'error',
  'vitest-coding-style/prefer-assert-over-expect-true': 'error',
  'vitest-coding-style/prefer-assert-not-ok-over-expect-false': 'error',
} as const satisfies EslintVitestCodingStyleRules;
