import { type ESLintPlugin } from '../types.mjs';
import { preferCanonicalLengthConstrainedType } from './prefer-canonical-length-constrained-type.mjs';

export const tsFortressRules = {
  'prefer-canonical-length-constrained-type':
    preferCanonicalLengthConstrainedType,
} as const satisfies ESLintPlugin['rules'];
