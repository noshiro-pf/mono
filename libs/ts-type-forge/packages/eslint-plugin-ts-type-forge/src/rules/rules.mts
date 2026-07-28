import { type ESLintPlugin } from '../types.mjs';
import { preferNonEmptyArray } from './prefer-non-empty-array.mjs';

export const tsTypeForgeRules = {
  'prefer-non-empty-array': preferNonEmptyArray,
} as const satisfies ESLintPlugin['rules'];
