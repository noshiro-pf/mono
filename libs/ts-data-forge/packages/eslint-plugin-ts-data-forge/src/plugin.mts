import { tsDataForgeRules } from './rules/index.mjs';
import { type ESLintPlugin } from './types.mjs';

export const eslintPluginTsDataForge: ESLintPlugin = {
  meta: {
    name: 'eslint-plugin-ts-data-forge',
  },
  rules: tsDataForgeRules,
} as const;
