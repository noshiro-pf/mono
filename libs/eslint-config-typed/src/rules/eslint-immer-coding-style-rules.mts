import type { EslintImmerCodingStyleRules } from '../types/index.mjs';

export const eslintImmerCodingStyleRules = {
  'immer-coding-style/mut-prefixed-draft': 'error',
  'immer-coding-style/prefer-curried-produce': 'error',
} as const satisfies EslintImmerCodingStyleRules;
