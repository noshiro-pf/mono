import { type EslintTotalFunctionsRules } from '../types/index.mjs';

export const eslintTotalFunctionsRules: EslintTotalFunctionsRules = {
  'total-functions/require-strict-mode': 'error',
  'total-functions/no-unsafe-type-assertion': 'error',

  // 動作が重いのと偽陽性があるためオフ
  'total-functions/no-unsafe-readonly-mutable-assignment': 'off',

  'total-functions/no-unsafe-mutable-readonly-assignment': 'off',
  'total-functions/no-enums': 'error',
  'total-functions/no-partial-url-constructor': 'off',
  'total-functions/no-partial-division': 'error',
  'total-functions/no-partial-string-normalize': 'error',
  'total-functions/no-premature-fp-ts-effects': 'error',
  'total-functions/no-partial-array-reduce': 'error',

  'total-functions/no-nested-fp-ts-effects': 'off',
  'total-functions/no-hidden-type-assertions': 'off',
};
