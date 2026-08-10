import { type EslintCypressRules } from '../types/index.mjs';
import { withDefaultOption } from '../types/rule-severity-branded.mjs';

export const eslintCypressRules: EslintCypressRules = {
  'cypress/no-assigning-return-values': 'error',
  'cypress/no-unnecessary-waiting': 'error',
  'cypress/no-async-tests': 'error',
  'cypress/assertion-before-screenshot': 'error',
  'cypress/require-data-selectors': 'off',
  'cypress/no-force': 'error',
  'cypress/no-pause': 'error',
  'cypress/unsafe-to-chain-command': withDefaultOption('error'),
  'cypress/no-async-before': 'error',
  'cypress/no-debug': 'error',
} as const;
