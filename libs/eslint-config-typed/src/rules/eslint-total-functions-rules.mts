import type { EslintTotalFunctionsRules } from '../types/index.mjs';

export const eslintTotalFunctionsRules = {
  'total-functions/require-strict-mode': 'error',

  // Prioritize this as it can check more strictly than @typescript-eslint/no-unsafe-type-assertion
  'total-functions/no-unsafe-type-assertion': 'error',

  // Off due to performance issues and false positives
  'total-functions/no-unsafe-readonly-mutable-assignment': 'off',

  'total-functions/no-unsafe-mutable-readonly-assignment': 'off',
  'total-functions/no-enums': 'error',
  'total-functions/no-partial-url-constructor': 'off',
  'total-functions/no-partial-division': 'error',
  'total-functions/no-partial-string-normalize': 'error',
  'total-functions/no-premature-fp-ts-effects': 'error',
  'total-functions/no-partial-array-reduce': 'error',

  'total-functions/no-nested-fp-ts-effects': 'off',
  // Moved to `ts-restrictions/no-hidden-type-assertions`; deprecated, and
  // removed at the next major (NEXT_MAJOR.md).
  'total-functions/no-hidden-type-assertions': 0,
} as const satisfies EslintTotalFunctionsRules;
