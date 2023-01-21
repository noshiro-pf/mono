'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

/** @type {LinterConfig} */
const config = {
  extends: ['./.eslintrc.custom-rules-added-cypress.js'],
  root: true,
  rules: {
    'jest/consistent-test-it': 'off',
    'jest/expect-expect': 'off',
  },
};

module.exports = config;
