'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const { plugins } = require('./eslint-plugins');
const { eslintReactRules } = require('./eslintrc-base');

/** @type {LinterConfig} */
const config = {
  root: true,
  settings: {
    react: {
      pragma: 'h',
      version: 'detect',
    },
  },
  globals: {
    expect: true,
    browser: true,
    global: true,
  },
  extends: [
    // 'preact',
    'plugin:react/all',
    'plugin:react-hooks/recommended',
    './.eslintrc.base.js',
  ],
  plugins: [plugins.react, plugins.reactHooks],
  rules: eslintReactRules,
};

module.exports = config;
