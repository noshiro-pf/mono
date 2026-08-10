import { type StrictOmit } from 'ts-type-forge';
import { type ESLintPlugin } from '../../types/index.mjs';
import { treeShakableRules } from './rules/index.mjs';

// forked from https://github.com/uhyo/eslint-plugin-tree-shakable/releases/tag/v1.2.0

export const eslintPluginTreeShakable: StrictOmit<ESLintPlugin, 'configs'> = {
  rules: treeShakableRules,
} as const;
