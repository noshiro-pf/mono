import { type ESLintPlugin } from '../../types/index.mjs';
import { tsDataForgeRules } from './rules/index.mjs';

export const eslintPluginTsDataForge: ESLintPlugin = {
  rules: tsDataForgeRules,
} as const;
