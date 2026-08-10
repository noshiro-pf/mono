import { type EslintReactRefreshRules } from '../types/index.mjs';
import { withDefaultOption } from '../types/rule-severity-branded.mjs';

export const eslintReactRefreshRules: EslintReactRefreshRules = {
  'react-refresh/only-export-components': withDefaultOption('error'),
} as const;
