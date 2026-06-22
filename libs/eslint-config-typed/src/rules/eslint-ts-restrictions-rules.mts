import {
  type EslintTsRestrictionsRules,
  withDefaultOption,
} from '../types/index.mjs';

export const eslintTsRestrictionsRules = {
  'ts-restrictions/no-restricted-syntax': 'off',
  'ts-restrictions/no-restricted-cast-name': 'off',
  'ts-restrictions/no-unnecessary-coalesce-undefined': 'error',
  'ts-restrictions/check-destructuring-completeness':
    withDefaultOption('error'),
} as const satisfies EslintTsRestrictionsRules;
