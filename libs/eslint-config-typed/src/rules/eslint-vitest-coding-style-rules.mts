import { type EslintVitestCodingStyleRules } from '../types/index.mjs';

export const eslintVitestCodingStyleRules = {
  'vitest-coding-style/no-expect-to-strict-equal': 'error',
  'vitest-coding-style/prefer-assert-deep-strict-equal-over-deep-equal':
    'error',
  'vitest-coding-style/prefer-assert-is-false-over-assert-not-ok': 'error',
  'vitest-coding-style/prefer-assert-is-false-over-expect-false': 'error',
  'vitest-coding-style/prefer-assert-is-false-over-negated-assert-is-true':
    'error',
  'vitest-coding-style/prefer-assert-is-true-over-assert': 'error',
  'vitest-coding-style/prefer-assert-is-true-over-expect-true': 'error',
  'vitest-coding-style/prefer-assert-is-true-over-negated-assert-is-false':
    'error',
} as const satisfies EslintVitestCodingStyleRules;
