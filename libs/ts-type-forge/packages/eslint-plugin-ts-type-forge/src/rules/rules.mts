import { type ESLintPlugin } from '../types.mjs';
import { preferCanonicalLengthConstrainedTuple } from './prefer-canonical-length-constrained-tuple.mjs';

export const tsTypeForgeRules = {
  'prefer-canonical-length-constrained-tuple':
    preferCanonicalLengthConstrainedTuple,
} as const satisfies ESLintPlugin['rules'];
