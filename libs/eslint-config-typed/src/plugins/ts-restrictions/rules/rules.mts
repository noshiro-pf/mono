import { type ESLintPlugin } from '../../../types/index.mjs';
import { checkDestructuringCompleteness } from './check-destructuring-completeness.mjs';
import { noRestrictedCastName } from './no-restricted-cast-name.mjs';
import { noRestrictedSyntax } from './no-restricted-syntax.mjs';
import { noUnnecessaryCoalesceUndefined } from './no-unnecessary-coalesce-undefined.mjs';

export const tsRestrictionsRules = {
  'check-destructuring-completeness': checkDestructuringCompleteness,
  'no-restricted-cast-name': noRestrictedCastName,
  'no-restricted-syntax': noRestrictedSyntax,
  'no-unnecessary-coalesce-undefined': noUnnecessaryCoalesceUndefined,
} as const satisfies ESLintPlugin['rules'];
