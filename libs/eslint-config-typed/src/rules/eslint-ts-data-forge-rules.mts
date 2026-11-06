import {
  type EslintTsDataForgeRules,
  withDefaultOption,
} from '../types/index.mjs';

export const eslintTsDataForgeRules = {
  'ts-data-forge/prefer-canonical-array-slicing': 'error',
  'ts-data-forge/prefer-canonical-length-guard': 'error',
  'ts-data-forge/prefer-canonical-length-cast': 'error',
  'ts-data-forge/prefer-arr-generate': 'error',
  'ts-data-forge/prefer-arr-is-array': 'error',
  'ts-data-forge/prefer-arr-scan': 'error',
  'ts-data-forge/prefer-arr-sum': 'error',
  'ts-data-forge/prefer-arr-uniq': 'error',
  'ts-data-forge/prefer-as-int': 'error',
  'ts-data-forge/prefer-is-non-null-object': 'error',
  'ts-data-forge/prefer-range-for-loop': 'error',
  'ts-data-forge/prefer-is-record-and-has-key': 'error',
  'ts-data-forge/prefer-num-safe-parse-int': 'error',
  'ts-data-forge/prefer-num-safe-parse-float': 'error',
  'ts-data-forge/no-side-effect-import': 'error',
  'ts-data-forge/no-unnecessary-type-guard': withDefaultOption('error'),
  'ts-data-forge/prefer-comparison-over-nullish-guard': 'error',
  'ts-data-forge/prefer-obj-over-entries-round-trip': 'error',
  'ts-data-forge/prefer-pipe-map-nullable': 'error',
} as const satisfies EslintTsDataForgeRules;
