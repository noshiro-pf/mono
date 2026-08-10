import {
  withDefaultOption,
  type EslintReactRefreshRules,
} from '../types/index.mjs';

export const eslintReactRefreshRules = {
  'react-refresh/only-export-components': withDefaultOption('error'),
} as const satisfies EslintReactRefreshRules;
