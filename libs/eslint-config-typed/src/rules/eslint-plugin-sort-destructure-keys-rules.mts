import {
  withDefaultOption,
  type EslintPluginSortDestructureKeysRules,
} from '../types/index.mjs';

export const eslintPluginSortDestructureKeysRules: EslintPluginSortDestructureKeysRules =
  {
    'sort-destructure-keys/sort-destructure-keys': withDefaultOption('error'),
  } as const;
