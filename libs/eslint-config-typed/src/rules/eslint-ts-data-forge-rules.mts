import { type EslintTsDataForgeRules } from '../types/index.mjs';

export const eslintTsDataForgeRules = {
  'ts-data-forge/prefer-as-int': 'error',
  'ts-data-forge/prefer-is-non-null-object': 'error',
  'ts-data-forge/prefer-arr-is-array': 'error',
  'ts-data-forge/prefer-arr-is-non-empty': 'error',
  'ts-data-forge/prefer-arr-sum': 'error',
  'ts-data-forge/prefer-range-for-loop': 'error',
  'ts-data-forge/prefer-arr-is-array-at-least-length': 'error',
  'ts-data-forge/prefer-arr-is-array-of-length': 'error',
  'ts-data-forge/prefer-is-record-and-has-key': 'error',
} as const satisfies EslintTsDataForgeRules;
