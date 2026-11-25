import type { EslintArrayFuncRules } from '../types/index.mjs';

export const eslintArrayFuncRules = {
  'array-func/from-map': 'error',
  'array-func/no-unnecessary-this-arg': 'error',
  'array-func/prefer-array-from': 'error',
  'array-func/avoid-reverse': 'error',

  // Covered by unicorn/prefer-array-flat-map
  'array-func/prefer-flat-map': 'off',

  // Covered by unicorn/prefer-array-flat (checks more patterns)
  'array-func/prefer-flat': 'off',
} as const satisfies EslintArrayFuncRules;
