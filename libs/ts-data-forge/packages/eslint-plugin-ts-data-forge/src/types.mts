import { type TSESLint } from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';

export type ESLintPlugin = DeepReadonly<TSESLint.FlatConfig.Plugin>;

export type ESLintFlatConfig = DeepReadonly<TSESLint.FlatConfig.Config>;
