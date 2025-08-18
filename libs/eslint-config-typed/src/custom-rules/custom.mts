import { type ESLintPlugin } from '../types/index.mjs';
import { noRestrictedSyntax } from './no-restricted-syntax2.mjs';

export const eslintPluginCustom: ESLintPlugin = {
  rules: {
    'no-restricted-syntax': noRestrictedSyntax,
  },
} as const;
