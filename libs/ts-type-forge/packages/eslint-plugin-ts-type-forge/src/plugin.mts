import { tsTypeForgeRules } from './rules/index.mjs';
import { type ESLintPlugin } from './types.mjs';

export const eslintPluginTsTypeForge: ESLintPlugin = {
  meta: {
    name: 'eslint-plugin-ts-type-forge',
  },
  rules: tsTypeForgeRules,
} as const;
