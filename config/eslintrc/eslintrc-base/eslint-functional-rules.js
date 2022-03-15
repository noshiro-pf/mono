'use strict';

// @ts-check

/** @typedef { import("./rules-record").LinterRulesRecord } LinterRulesRecord */

/** @type {LinterRulesRecord} */
const eslintFunctionalRules = {
  // 'functional/immutable-data': 'warn',
  'functional/no-method-signature': 'warn',
  // 'functional/prefer-readonly-type': 'warn',
};

module.exports = eslintFunctionalRules;
