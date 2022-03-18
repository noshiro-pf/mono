'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

/** @type {LinterConfig} */
const config = {
  extends: ['./.eslintrc.custom-rules-added-react.js'],
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
};

module.exports = config;
