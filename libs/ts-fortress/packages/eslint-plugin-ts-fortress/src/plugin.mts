import { tsFortressRules } from './rules/index.mjs';
import { type ESLintPlugin } from './types.mjs';

export const eslintPluginTsFortress: ESLintPlugin = {
  meta: {
    name: 'eslint-plugin-ts-fortress',
  },
  rules: tsFortressRules,
} as const;
