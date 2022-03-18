'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const { plugins } = require('./eslint-plugins');
const { eslintReactRules, eslintReactHooksRules } = require('./eslint-rules');

/** @type {LinterConfig} */
const config = {
  extends: ['./.eslintrc.custom-rules-added.js'],
  plugins: [plugins.react, plugins.reactHooks],
  rules: { ...eslintReactRules, ...eslintReactHooksRules },
};

module.exports = config;
