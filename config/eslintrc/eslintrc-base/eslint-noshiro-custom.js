'use strict';

// @ts-check

/** @typedef { import("./rules-record").LinterRulesRecord } LinterRulesRecord */

/** @type {LinterRulesRecord} */
const eslintNoshiroCustomRules = {
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

module.exports = eslintNoshiroCustomRules;
