import type { ESLintPlugin } from '../../../types/index.mjs';
import { mutPrefixedDraftRule } from './mut-prefixed-draft.mjs';
import { preferCurriedProduceRule } from './prefer-curried-produce.mjs';

export const immerCodingStyleRules = {
  'mut-prefixed-draft': mutPrefixedDraftRule,
  'prefer-curried-produce': preferCurriedProduceRule,
} as const satisfies ESLintPlugin['rules'];
