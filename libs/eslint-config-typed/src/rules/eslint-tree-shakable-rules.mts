import { type EslintTreeShakableRules } from '../types/index.mjs';

export const eslintTreeShakableRules = {
  'tree-shakable/import-star': 'error',
} as const satisfies EslintTreeShakableRules;
