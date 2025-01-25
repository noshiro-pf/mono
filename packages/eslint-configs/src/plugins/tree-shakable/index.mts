import { type Plugin } from '../../types/index.mjs';
import { rules } from './rules/index.mjs';

// forked from https://github.com/uhyo/eslint-plugin-tree-shakable/releases/tag/v1.2.0

export const eslintPluginTreeShakable: Omit<Plugin, 'configs'> = { rules };
