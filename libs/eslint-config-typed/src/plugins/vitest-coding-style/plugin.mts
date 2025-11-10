import { type ESLintPlugin } from '../../types/index.mjs';
import { vitestCodingStyleRules } from './rules/index.mjs';

export const eslintPluginVitestCodingStyle: Omit<ESLintPlugin, 'configs'> = {
  rules: vitestCodingStyleRules,
} as const;
