import { type RuleDefinition } from '@eslint/core';
import { type FlatConfig as FlatConfig_ } from '@typescript-eslint/utils/ts-eslint';

export type FlatConfig = DeepReadonly<FlatConfig_.Config>;

// export type Plugin = DeepReadonly<ESLint.Plugin>;
export type Plugin = DeepReadonly<FlatConfig_.Plugin>;

export type Rule = DeepReadonly<RuleDefinition>;
// Exclude<LooseRuleDefinition, LooseRuleCreateFunction>;

// export type Rules = DeepReadonly<ESLint.Plugin['rules']>;
export type Rules = Record<string, Rule>;
