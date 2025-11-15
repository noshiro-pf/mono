import { withDefaultOption, type EslintMathRules } from '../types/index.mjs';

export const eslintMathRules = {
  'math/abs': ['error', { prefer: 'Math.abs', aggressive: true }],
  'math/no-static-infinity-calculations': 'error',
  'math/no-static-nan-calculations': 'error',
  'math/prefer-exponentiation-operator': 'error',
  'math/prefer-math-cbrt': 'error',
  'math/prefer-math-e': 'error',
  'math/prefer-math-hypot': 'error',
  'math/prefer-math-ln10': 'error',
  'math/prefer-math-ln2': 'error',
  'math/prefer-math-log10': 'error',
  'math/prefer-math-log10e': 'error',
  'math/prefer-math-log2': 'error',
  'math/prefer-math-log2e': 'error',
  'math/prefer-math-pi': 'error',
  'math/prefer-math-sqrt': 'error',
  'math/prefer-math-sqrt1-2': 'error',
  'math/prefer-math-sqrt2': 'error',

  // Math.sumPrecise is a Stage 2 proposal and not yet available in standard JavaScript environments
  // https://github.com/tc39/proposal-math-sum
  'math/prefer-math-sum-precise': 'off',

  'math/prefer-math-trunc': withDefaultOption('error'),
  'math/prefer-number-epsilon': 'error',

  // Covered by unicorn/prefer-number-properties (checks more patterns including global isFinite())
  'math/prefer-number-is-finite': 'off',

  'math/prefer-number-is-integer': 'error',

  // Covered by unicorn/prefer-number-properties (checks more patterns including global isNaN())
  'math/prefer-number-is-nan': 'off',

  'math/prefer-number-is-safe-integer': 'error',
  'math/prefer-number-max-safe-integer': 'error',
  'math/prefer-number-max-value': 'error',
  'math/prefer-number-min-safe-integer': 'error',
  'math/prefer-number-min-value': 'error',
} as const satisfies EslintMathRules;
