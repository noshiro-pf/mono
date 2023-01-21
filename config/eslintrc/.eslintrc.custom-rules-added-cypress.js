'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const { plugins } = require('./eslint-plugins');
const { eslintCypressRules } = require('./eslint-rules');

/** @type {LinterConfig} */
const config = {
  env: {
    'cypress/globals': true,
  },
  extends: ['./.eslintrc.custom-rules-added.js'],
  plugins: [plugins.cypress],
  rules: { ...eslintCypressRules },
};

module.exports = config;
