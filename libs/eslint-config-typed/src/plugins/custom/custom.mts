import { type ESLintPlugin } from '../../types/index.mjs';
import { customRules } from './rules/index.mjs';

export const eslintPluginCustom: ESLintPlugin = {
  rules: customRules,
} as const;
