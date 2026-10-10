import { type ESLintPlugin } from '../types.mjs';
import { noTypeOnlyCodec } from './no-type-only-codec.mjs';
import { preferCanonicalLengthConstrainedType } from './prefer-canonical-length-constrained-type.mjs';
import { preferNamespaceImport } from './prefer-namespace-import.mjs';
import { preferSchemaOverGuardChain } from './prefer-schema-over-guard-chain.mjs';

export const tsFortressRules = {
  'no-type-only-codec': noTypeOnlyCodec,
  'prefer-canonical-length-constrained-type':
    preferCanonicalLengthConstrainedType,
  'prefer-namespace-import': preferNamespaceImport,
  'prefer-schema-over-guard-chain': preferSchemaOverGuardChain,
} as const satisfies ESLintPlugin['rules'];
