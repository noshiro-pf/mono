import { type ESLintPlugin } from '../../types/index.mjs';
import { reactCodingStyleRules } from './rules/index.mjs';

export const eslintPluginReactCodingStyle: Omit<ESLintPlugin, 'configs'> = {
  rules: reactCodingStyleRules,
} as const;
