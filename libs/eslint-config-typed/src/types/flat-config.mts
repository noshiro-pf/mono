import { type RuleDefinition } from '@eslint/core';
import { type FlatConfig as FlatConfig_ } from '@typescript-eslint/utils/ts-eslint';

export type FlatConfig = DeepReadonly<FlatConfig_.Config>;

export type ESLintPlugin = DeepReadonly<FlatConfig_.Plugin>;

export type Rule = DeepReadonly<RuleDefinition>;

// Exclude<LooseRuleDefinition, LooseRuleCreateFunction>;
export type Rules = ReadonlyRecord<string, Rule>;
