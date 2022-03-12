'use strict';

// @ts-check

/** @typedef { import("./rules-record").LinterRulesRecord } LinterRulesRecord */

/** @type {LinterRulesRecord} */
const eslintJestRules = {
  'jest/consistent-test-it': ['error', { fn: 'test' }],
  'jest/prefer-expect-assertions': 'off',
  'jest/no-conditional-in-test': 'off',
  'jest/prefer-lowercase-title': 'off',
  'jest/require-hook': 'off',
  'jest/require-top-level-describe': 'off',
  'jest/valid-title': 'off',
  'jest/no-commented-out-tests': 'off',
  'jest/no-export': 'off',
};

module.exports = eslintJestRules;
