import { type ESLintPlugin } from '../../../types/index.mjs';
import { preferCurriedProduceRule } from './prefer-curried-produce.mjs';

export const immerCodingStyleRules = {
  'prefer-curried-produce': preferCurriedProduceRule,
} as const satisfies ESLintPlugin['rules'];
