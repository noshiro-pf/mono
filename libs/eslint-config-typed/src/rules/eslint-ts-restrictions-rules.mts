import { type EslintTsRestrictionsRules } from '../types/index.mjs';

export const eslintTsRestrictionsRules = {
  'ts-restrictions/no-restricted-syntax': 'off',
  'ts-restrictions/no-restricted-cast-name': 'off',
} as const satisfies EslintTsRestrictionsRules;
