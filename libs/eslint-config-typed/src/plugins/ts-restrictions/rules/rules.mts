import { type ESLintPlugin } from '../../../types/index.mjs';
import { noRestrictedCastName } from './no-restricted-cast-name.mjs';
import { noRestrictedSyntax } from './no-restricted-syntax.mjs';

export const tsRestrictionsRules = {
  'no-restricted-cast-name': noRestrictedCastName,
  'no-restricted-syntax': noRestrictedSyntax,
} as const satisfies ESLintPlugin['rules'];
