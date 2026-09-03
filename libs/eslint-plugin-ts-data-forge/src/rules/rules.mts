import { type ESLintPlugin } from '../types.mjs';
import { noSideEffectImport } from './no-side-effect-import.mjs';
import { noUnnecessaryTypeGuard } from './no-unnecessary-type-guard.mjs';
import { preferArrIsArray } from './prefer-arr-is-array.mjs';
import { preferArrScan } from './prefer-arr-scan.mjs';
import { preferArrSum } from './prefer-arr-sum.mjs';
import { preferAsInt } from './prefer-as-int.mjs';
import { preferCanonicalArraySlicing } from './prefer-canonical-array-slicing.mjs';
import { preferCanonicalLengthCast } from './prefer-canonical-length-cast.mjs';
import { preferCanonicalLengthGuard } from './prefer-canonical-length-guard.mjs';
import { preferComparisonOverNullishGuard } from './prefer-comparison-over-nullish-guard.mjs';
import { preferIsNonNullObject } from './prefer-is-non-null-object.mjs';
import { preferIsRecordAndHasKey } from './prefer-is-record-and-has-key.mjs';
import { preferNumSafeParseFloat } from './prefer-num-safe-parse-float.mjs';
import { preferNumSafeParseInt } from './prefer-num-safe-parse-int.mjs';
import { preferObjOverEntriesRoundTrip } from './prefer-obj-over-entries-round-trip.mjs';
import { preferRangeForLoop } from './prefer-range-for-loop.mjs';

export const tsDataForgeRules = {
  'prefer-canonical-array-slicing': preferCanonicalArraySlicing,
  'prefer-canonical-length-guard': preferCanonicalLengthGuard,
  'prefer-canonical-length-cast': preferCanonicalLengthCast,
  'prefer-arr-is-array': preferArrIsArray,
  'prefer-arr-scan': preferArrScan,
  'prefer-arr-sum': preferArrSum,
  'prefer-as-int': preferAsInt,
  'prefer-is-non-null-object': preferIsNonNullObject,
  'prefer-range-for-loop': preferRangeForLoop,
  'prefer-is-record-and-has-key': preferIsRecordAndHasKey,
  'prefer-num-safe-parse-int': preferNumSafeParseInt,
  'prefer-num-safe-parse-float': preferNumSafeParseFloat,
  'no-side-effect-import': noSideEffectImport,
  'no-unnecessary-type-guard': noUnnecessaryTypeGuard,
  'prefer-comparison-over-nullish-guard': preferComparisonOverNullishGuard,
  'prefer-obj-over-entries-round-trip': preferObjOverEntriesRoundTrip,
} as const satisfies ESLintPlugin['rules'];
