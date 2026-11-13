import {
  type EslintTsUiRestrictionsRules,
  withDefaultOption,
} from '../types/index.mjs';

export const eslintTsUiRestrictionsRules = {
  'ts-ui-restrictions/jsx-boolean-logical-operands': 'error',
  'ts-ui-restrictions/require-ime-guard': withDefaultOption('error'),
} as const satisfies EslintTsUiRestrictionsRules;
