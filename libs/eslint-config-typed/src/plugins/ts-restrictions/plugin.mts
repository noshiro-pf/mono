import { type ESLintPlugin } from '../../types/index.mjs';
import { tsRestrictionsRules } from './rules/index.mjs';

export const eslintPluginTsRestrictions: ESLintPlugin = {
  rules: tsRestrictionsRules,
} as const;
