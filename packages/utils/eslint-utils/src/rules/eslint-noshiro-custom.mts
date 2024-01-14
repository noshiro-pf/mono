import { type LinterRulesRecord } from '../types/types.mjs';

export const eslintNoshiroCustomRules: LinterRulesRecord = {
  '@typescript-eslint/prefer-readonly-parameter-types': 'off',
  'noshiro-custom/prefer-readonly-parameter-types': [
    'warn',
    {
      checkParameterProperties: true,
      ignoreInferredTypes: true,
      allow: [
        'ServiceWorkerRegistration',
        'Observable',
        'Iterator',
        'Iterable',
      ],
    },
  ],
};
