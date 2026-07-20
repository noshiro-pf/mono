import { type ESLintPlugin } from '../../../types/index.mjs';
import { noUnnecessaryTypeGuard } from './no-unnecessary-type-guard.mjs';
import { preferArrIsArray } from './prefer-arr-is-array.mjs';
import { preferArrIsBoundedLengthArray } from './prefer-arr-is-bounded-length-array.mjs';
import { preferArrIsFixedLengthArray } from './prefer-arr-is-fixed-length-array.mjs';
import { preferArrIsMaxLengthArray } from './prefer-arr-is-max-length-array.mjs';
import { preferArrIsMinLengthArray } from './prefer-arr-is-min-length-array.mjs';
import { preferArrIsNonEmpty } from './prefer-arr-is-non-empty.mjs';
import { preferArrSum } from './prefer-arr-sum.mjs';
import { preferAsInt } from './prefer-as-int.mjs';
import { preferCanonicalArraySlicing } from './prefer-canonical-array-slicing.mjs';
import { preferComparisonOverNullishGuard } from './prefer-comparison-over-nullish-guard.mjs';
import { preferIsNonNullObject } from './prefer-is-non-null-object.mjs';
import { preferIsRecordAndHasKey } from './prefer-is-record-and-has-key.mjs';
import { preferNumSafeParseFloat } from './prefer-num-safe-parse-float.mjs';
import { preferNumSafeParseInt } from './prefer-num-safe-parse-int.mjs';
import { preferRangeForLoop } from './prefer-range-for-loop.mjs';

export const tsDataForgeRules = {
  'prefer-canonical-array-slicing': preferCanonicalArraySlicing,
  'prefer-arr-is-min-length-array': preferArrIsMinLengthArray,
  'prefer-arr-is-max-length-array': preferArrIsMaxLengthArray,
  'prefer-arr-is-bounded-length-array': preferArrIsBoundedLengthArray,
  'prefer-arr-is-fixed-length-array': preferArrIsFixedLengthArray,
  'prefer-arr-is-array': preferArrIsArray,
  'prefer-arr-is-non-empty': preferArrIsNonEmpty,
  'prefer-arr-sum': preferArrSum,
  'prefer-as-int': preferAsInt,
  'prefer-is-non-null-object': preferIsNonNullObject,
  'prefer-range-for-loop': preferRangeForLoop,
  'prefer-is-record-and-has-key': preferIsRecordAndHasKey,
  'prefer-num-safe-parse-int': preferNumSafeParseInt,
  'prefer-num-safe-parse-float': preferNumSafeParseFloat,
  'no-unnecessary-type-guard': noUnnecessaryTypeGuard,
  'prefer-comparison-over-nullish-guard': preferComparisonOverNullishGuard,
} as const satisfies ESLintPlugin['rules'];
