import { type Plugin } from '../../types/index.mjs';
import { rules } from './rules/index.mjs';

// forked from https://github.com/danielnixon/eslint-plugin-total-functions v7.1.0

export const eslintPluginTotalFunctions: Omit<Plugin, 'configs'> = {
  rules,
} as const;
