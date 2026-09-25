import { type ESLintPlugin } from '../../../types/index.mjs';
import { checkDestructuringCompleteness } from './check-destructuring-completeness.mjs';
import { noNegatedComparison } from './no-negated-comparison.mjs';
import { noRestrictedCastName } from './no-restricted-cast-name.mjs';
import { noRestrictedSyntax } from './no-restricted-syntax.mjs';
import { noStringSpread } from './no-string-spread.mjs';
import { noUnnecessaryArrayFrom } from './no-unnecessary-array-from.mjs';
import { noUnnecessaryCoalesceUndefined } from './no-unnecessary-coalesce-undefined.mjs';
import { preferCurriedCall } from './prefer-curried-call.mjs';
import { preferDedent } from './prefer-dedent.mjs';
import { preferLogicalOverBooleanTernary } from './prefer-logical-over-boolean-ternary.mjs';
import { preferNonMutatingArrayMethod } from './prefer-non-mutating-array-method.mjs';
import { preferNullishCoalescingWhenSafe } from './prefer-nullish-coalescing-when-safe.mjs';
import { preferRangeInNumberLineOrder } from './prefer-range-in-number-line-order.mjs';
import { preferTernary } from './prefer-ternary.mjs';

export const tsRestrictionsRules = {
  'check-destructuring-completeness': checkDestructuringCompleteness,
  'no-negated-comparison': noNegatedComparison,
  'no-restricted-cast-name': noRestrictedCastName,
  'no-restricted-syntax': noRestrictedSyntax,
  'no-string-spread': noStringSpread,
  'no-unnecessary-array-from': noUnnecessaryArrayFrom,
  'no-unnecessary-coalesce-undefined': noUnnecessaryCoalesceUndefined,
  'prefer-curried-call': preferCurriedCall,
  'prefer-dedent': preferDedent,
  'prefer-logical-over-boolean-ternary': preferLogicalOverBooleanTernary,
  'prefer-non-mutating-array-method': preferNonMutatingArrayMethod,
  'prefer-nullish-coalescing-when-safe': preferNullishCoalescingWhenSafe,
  'prefer-range-in-number-line-order': preferRangeInNumberLineOrder,
  'prefer-ternary': preferTernary,
} as const satisfies ESLintPlugin['rules'];
