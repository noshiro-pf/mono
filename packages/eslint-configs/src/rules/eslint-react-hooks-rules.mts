import { type EslintReactHooksRules } from '../types/index.mjs';
import { withDefaultOption } from '../types/rule-severity-branded.mjs';

export const eslintReactHooksRules: EslintReactHooksRules = {
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': withDefaultOption('error'),
} as const;
