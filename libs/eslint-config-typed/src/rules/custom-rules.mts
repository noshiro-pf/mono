import { type EslintCustomRules } from '../types/index.mjs';

export const eslintCustomRules = {
  'custom/no-restricted-syntax': 'off',
} as const satisfies EslintCustomRules;
