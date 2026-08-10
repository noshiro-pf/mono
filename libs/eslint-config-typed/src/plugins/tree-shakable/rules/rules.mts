import { type ESLintPlugin } from '../../../types/index.mjs';
import { importStarRule } from './import-star.mjs';

export const treeShakableRules = {
  'import-star': importStarRule,
} as const satisfies ESLintPlugin['rules'];
