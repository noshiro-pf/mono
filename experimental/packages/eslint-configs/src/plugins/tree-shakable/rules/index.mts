import { type Plugin } from '../../../types/index.mjs';
import { importStarRule } from './import-star.mjs';

export const rules = {
  'import-star': importStarRule,
} as const satisfies Plugin['rules'];
