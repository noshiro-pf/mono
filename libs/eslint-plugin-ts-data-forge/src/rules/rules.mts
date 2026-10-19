import { skipBrowserEvaluatedFunctions } from 'eslint-rule-forge';
import type { ESLintPlugin } from '../types.mjs';
import { noSideEffectImport } from './no-side-effect-import.mjs';
import { noUnnecessaryTypeGuard } from './no-unnecessary-type-guard.mjs';
import { preferArrGenerate } from './prefer-arr-generate.mjs';
import { preferArrIsArray } from './prefer-arr-is-array.mjs';
import { preferArrScan } from './prefer-arr-scan.mjs';
import { preferArrSum } from './prefer-arr-sum.mjs';
import { preferArrUniq } from './prefer-arr-uniq.mjs';
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

// Every rule leaves alone the functions Playwright and Puppeteer run in the
// page (`page.evaluate(() => …)`), where nothing the file imports exists.
export const tsDataForgeRules = {
  'prefer-canonical-array-slicing': skipBrowserEvaluatedFunctions(
    preferCanonicalArraySlicing,
  ),
  'prefer-canonical-length-guard': skipBrowserEvaluatedFunctions(
    preferCanonicalLengthGuard,
  ),
  'prefer-canonical-length-cast': skipBrowserEvaluatedFunctions(
    preferCanonicalLengthCast,
  ),
  'prefer-arr-generate': skipBrowserEvaluatedFunctions(preferArrGenerate),
  'prefer-arr-is-array': skipBrowserEvaluatedFunctions(preferArrIsArray),
  'prefer-arr-scan': skipBrowserEvaluatedFunctions(preferArrScan),
  'prefer-arr-sum': skipBrowserEvaluatedFunctions(preferArrSum),
  'prefer-arr-uniq': skipBrowserEvaluatedFunctions(preferArrUniq),
  'prefer-as-int': skipBrowserEvaluatedFunctions(preferAsInt),
  'prefer-is-non-null-object': skipBrowserEvaluatedFunctions(
    preferIsNonNullObject,
  ),
  'prefer-range-for-loop': skipBrowserEvaluatedFunctions(preferRangeForLoop),
  'prefer-is-record-and-has-key': skipBrowserEvaluatedFunctions(
    preferIsRecordAndHasKey,
  ),
  'prefer-num-safe-parse-int': skipBrowserEvaluatedFunctions(
    preferNumSafeParseInt,
  ),
  'prefer-num-safe-parse-float': skipBrowserEvaluatedFunctions(
    preferNumSafeParseFloat,
  ),
  'no-side-effect-import': skipBrowserEvaluatedFunctions(noSideEffectImport),
  'no-unnecessary-type-guard': skipBrowserEvaluatedFunctions(
    noUnnecessaryTypeGuard,
  ),
  'prefer-comparison-over-nullish-guard': skipBrowserEvaluatedFunctions(
    preferComparisonOverNullishGuard,
  ),
  'prefer-obj-over-entries-round-trip': skipBrowserEvaluatedFunctions(
    preferObjOverEntriesRoundTrip,
  ),
} as const satisfies ESLintPlugin['rules'];
