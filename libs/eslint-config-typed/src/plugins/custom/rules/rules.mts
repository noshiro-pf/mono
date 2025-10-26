import { type ESLintPlugin } from '../../../types/index.mjs';
import { noRestrictedSyntax } from './no-restricted-syntax2.mjs';

export const customRules = {
  'no-restricted-syntax': noRestrictedSyntax,
} as const satisfies ESLintPlugin['rules'];
