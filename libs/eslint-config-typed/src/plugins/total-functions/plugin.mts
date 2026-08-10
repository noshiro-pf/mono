import { type StrictOmit } from 'ts-type-forge';
import { type ESLintPlugin } from '../../types/index.mjs';
import { totalFunctionsRules } from './rules/index.mjs';

// forked from https://github.com/danielnixon/eslint-plugin-total-functions v7.1.0

export const eslintPluginTotalFunctions: StrictOmit<ESLintPlugin, 'configs'> = {
  rules: totalFunctionsRules,
} as const;
