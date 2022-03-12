'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const { eslintReactRules } = require('./eslintrc-base');

/**
 * https://github.com/yannickcr/eslint-plugin-react
 */
/** @type {LinterConfig} */
const config = {
  root: true,
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'plugin:react/all',
    'plugin:react-hooks/recommended',
    './.eslintrc.base.js',
  ],
  plugins: ['react', 'react-hooks'],
  rules: eslintReactRules,
};

module.exports = config;
