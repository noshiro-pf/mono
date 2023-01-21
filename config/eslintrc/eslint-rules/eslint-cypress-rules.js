'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-cypress-rules").EslintCypressRules } EslintCypressRules */

/** @type {EslintCypressRules} */
const eslintCypressRules = {
  'cypress/no-assigning-return-values': 'error',
  'cypress/no-unnecessary-waiting': 'error',
  'cypress/no-async-tests': 'error',
  'cypress/assertion-before-screenshot': 'error',
  'cypress/require-data-selectors': 'off',
  'cypress/no-force': 'error',
  'cypress/no-pause': 'error',
};

module.exports = { eslintCypressRules };
