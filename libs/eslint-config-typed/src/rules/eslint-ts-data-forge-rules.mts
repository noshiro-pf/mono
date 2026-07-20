import {
  type EslintTsDataForgeRules,
  withDefaultOption,
} from '../types/index.mjs';

export const eslintTsDataForgeRules = {
  'ts-data-forge/prefer-canonical-array-slicing': 'error',
  'ts-data-forge/prefer-as-int': 'error',
  'ts-data-forge/prefer-is-non-null-object': 'error',
  'ts-data-forge/prefer-arr-is-array': 'error',
  'ts-data-forge/prefer-arr-is-non-empty': 'error',
  'ts-data-forge/prefer-arr-sum': 'error',
  'ts-data-forge/prefer-range-for-loop': 'error',
  'ts-data-forge/prefer-arr-is-min-length-array': 'error',
  'ts-data-forge/prefer-arr-is-max-length-array': 'error',
  'ts-data-forge/prefer-arr-is-bounded-length-array': 'error',
  'ts-data-forge/prefer-arr-is-fixed-length-array': 'error',
  'ts-data-forge/prefer-is-record-and-has-key': 'error',
  'ts-data-forge/prefer-num-safe-parse-int': 'error',
  'ts-data-forge/prefer-num-safe-parse-float': 'error',
  'ts-data-forge/no-unnecessary-type-guard': withDefaultOption('error'),
  'ts-data-forge/prefer-comparison-over-nullish-guard': 'error',
} as const satisfies EslintTsDataForgeRules;
