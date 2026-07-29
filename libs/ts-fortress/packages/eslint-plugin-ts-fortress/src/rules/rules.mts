import { type ESLintPlugin } from '../types.mjs';
import { preferNonEmptyArray } from './prefer-non-empty-array.mjs';

export const tsFortressRules = {
  'prefer-non-empty-array': preferNonEmptyArray,
} as const satisfies ESLintPlugin['rules'];
