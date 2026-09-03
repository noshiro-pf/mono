import { type ESLintPlugin } from '../types.mjs';
import { preferCanonicalLengthConstrainedType } from './prefer-canonical-length-constrained-type.mjs';
import { preferNamespaceImport } from './prefer-namespace-import.mjs';

export const tsFortressRules = {
  'prefer-canonical-length-constrained-type':
    preferCanonicalLengthConstrainedType,
  'prefer-namespace-import': preferNamespaceImport,
} as const satisfies ESLintPlugin['rules'];
