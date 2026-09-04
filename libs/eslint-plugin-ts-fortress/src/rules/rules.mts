import { type ESLintPlugin } from '../types.mjs';
import { preferCanonicalLengthConstrainedType } from './prefer-canonical-length-constrained-type.mjs';
import { preferNamespaceImport } from './prefer-namespace-import.mjs';
import { preferSchemaOverGuardChain } from './prefer-schema-over-guard-chain.mjs';

export const tsFortressRules = {
  'prefer-canonical-length-constrained-type':
    preferCanonicalLengthConstrainedType,
  'prefer-namespace-import': preferNamespaceImport,
  'prefer-schema-over-guard-chain': preferSchemaOverGuardChain,
} as const satisfies ESLintPlugin['rules'];
