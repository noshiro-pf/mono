import { type ESLintPlugin } from '../../types/index.mjs';
import { totalFunctionsRules } from './rules/index.mjs';

// forked from https://github.com/danielnixon/eslint-plugin-total-functions v7.1.0

export const eslintPluginTotalFunctions: Omit<ESLintPlugin, 'configs'> = {
  rules: totalFunctionsRules,
} as const;
