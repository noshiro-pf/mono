import { type ESLintPlugin } from '../../types/index.mjs';
import { strictDependenciesRules } from './rules/index.mjs';

// Forked from https://github.com/knowledge-work/eslint-plugin-strict-dependencies/blob/v1.3.27/index.js
export const eslintPluginStrictDependencies: Omit<ESLintPlugin, 'configs'> = {
  rules: strictDependenciesRules,
} as const;
