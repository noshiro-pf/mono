import { type ESLintPlugin } from '../types.mjs';
import { preferCanonicalLengthConstrainedTuple } from './prefer-canonical-length-constrained-tuple.mjs';
import { preferReadonlyOrMutableRecord } from './prefer-readonly-or-mutable-record.mjs';
import { preferStrictOrRelaxedUtilityType } from './prefer-strict-or-relaxed-utility-type.mjs';

export const tsTypeForgeRules = {
  'prefer-canonical-length-constrained-tuple':
    preferCanonicalLengthConstrainedTuple,
  'prefer-readonly-or-mutable-record': preferReadonlyOrMutableRecord,
  'prefer-strict-or-relaxed-utility-type': preferStrictOrRelaxedUtilityType,
} as const satisfies ESLintPlugin['rules'];
