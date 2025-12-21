import { type ESLintPlugin } from '../../types/index.mjs';
import { immerCodingStyleRules } from './rules/index.mjs';

export const eslintPluginImmerCodingStyle: Omit<ESLintPlugin, 'configs'> = {
  rules: immerCodingStyleRules,
} as const;
