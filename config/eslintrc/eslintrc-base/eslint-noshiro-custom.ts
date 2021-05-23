import type { Linter } from 'eslint';

export const eslintNoshiroCustomRules: Linter.RulesRecord = {
  '@typescript-eslint/prefer-readonly-parameter-types': 'off',
  'noshiro-custom/prefer-readonly-parameter-types': [
    'warn',
    {
      checkParameterProperties: true,
      ignoreInferredTypes: true,
      allow: ['ServiceWorkerRegistration', 'Observable'],
    },
  ],
};
