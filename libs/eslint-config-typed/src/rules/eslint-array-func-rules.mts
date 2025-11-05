import { type EslintArrayFuncRules } from '../types/index.mjs';

export const eslintArrayFuncRules = {
  'array-func/from-map': 'error',
  'array-func/no-unnecessary-this-arg': 'error',
  'array-func/prefer-array-from': 'error',
  'array-func/avoid-reverse': 'error',

  // Covered by unicorn/prefer-array-flat-map
  'array-func/prefer-flat-map': 'off',

  'array-func/prefer-flat': 'error',
} as const satisfies EslintArrayFuncRules;
