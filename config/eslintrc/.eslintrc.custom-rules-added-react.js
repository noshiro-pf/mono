'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const { plugins } = require('./eslint-plugins');
const {
  eslintReactRules,
  eslintReactHooksRules,
  eslintReactRefresh,
} = require('./eslint-rules');

/** @type {LinterConfig} */
const config = {
  extends: ['./.eslintrc.custom-rules-added.js'],
  plugins: [plugins.react, plugins.reactHooks, plugins.reactRefresh],
  rules: {
    ...eslintReactRules,
    ...eslintReactHooksRules,
    ...eslintReactRefresh,
  },
};

module.exports = config;
