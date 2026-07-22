import { type ESLintPlugin } from '../../../types/index.mjs';
import { checkDestructuringCompleteness } from './check-destructuring-completeness.mjs';
import { noRestrictedCastName } from './no-restricted-cast-name.mjs';
import { noRestrictedSyntax } from './no-restricted-syntax.mjs';
import { noStringSpread } from './no-string-spread.mjs';
import { noUnnecessaryArrayFrom } from './no-unnecessary-array-from.mjs';
import { noUnnecessaryCoalesceUndefined } from './no-unnecessary-coalesce-undefined.mjs';
import { preferNonMutatingArrayMethod } from './prefer-non-mutating-array-method.mjs';

export const tsRestrictionsRules = {
  'check-destructuring-completeness': checkDestructuringCompleteness,
  'no-restricted-cast-name': noRestrictedCastName,
  'no-restricted-syntax': noRestrictedSyntax,
  'no-string-spread': noStringSpread,
  'no-unnecessary-array-from': noUnnecessaryArrayFrom,
  'no-unnecessary-coalesce-undefined': noUnnecessaryCoalesceUndefined,
  'prefer-non-mutating-array-method': preferNonMutatingArrayMethod,
} as const satisfies ESLintPlugin['rules'];
