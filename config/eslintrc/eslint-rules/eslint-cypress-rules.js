'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-cypress-rules").EslintCypressRules } EslintCypressRules */

/** @type {EslintCypressRules} */
const eslintCypressRules = {
  'cypress/no-assigning-return-values': 'warn',
  'cypress/no-unnecessary-waiting': 'warn',
  'cypress/no-async-tests': 'warn',
  'cypress/assertion-before-screenshot': 'warn',
  'cypress/require-data-selectors': 'warn',
  'cypress/no-force': 'warn',
  'cypress/no-pause': 'warn',
};

module.exports = { eslintCypressRules };
