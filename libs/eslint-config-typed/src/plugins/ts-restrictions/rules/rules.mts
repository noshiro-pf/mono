import { type ESLintPlugin } from '../../../types/index.mjs';
import { checkDestructuringCompleteness } from './check-destructuring-completeness.mjs';
import { noRestrictedCastName } from './no-restricted-cast-name.mjs';
import { noRestrictedSyntax } from './no-restricted-syntax.mjs';

export const tsRestrictionsRules = {
  'check-destructuring-completeness': checkDestructuringCompleteness,
  'no-restricted-cast-name': noRestrictedCastName,
  'no-restricted-syntax': noRestrictedSyntax,
} as const satisfies ESLintPlugin['rules'];
