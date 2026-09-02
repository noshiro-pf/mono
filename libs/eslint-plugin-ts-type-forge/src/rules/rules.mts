import { type ESLintPlugin } from '../types.mjs';
import { noSideEffectImport } from './no-side-effect-import.mjs';
import { preferCanonicalLengthConstrainedTuple } from './prefer-canonical-length-constrained-tuple.mjs';
import { preferCanonicalMutableRecord } from './prefer-canonical-mutable-record.mjs';
import { preferReadonlyOrMutableRecord } from './prefer-readonly-or-mutable-record.mjs';
import { preferStrictOrRelaxedUtilityType } from './prefer-strict-or-relaxed-utility-type.mjs';

export const tsTypeForgeRules = {
  'no-side-effect-import': noSideEffectImport,
  'prefer-canonical-length-constrained-tuple':
    preferCanonicalLengthConstrainedTuple,
  'prefer-canonical-mutable-record': preferCanonicalMutableRecord,
  'prefer-readonly-or-mutable-record': preferReadonlyOrMutableRecord,
  'prefer-strict-or-relaxed-utility-type': preferStrictOrRelaxedUtilityType,
} as const satisfies ESLintPlugin['rules'];
