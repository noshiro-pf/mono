'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

/**
 * https://github.com/yannickcr/eslint-plugin-react
 */
/** @type {LinterConfig} */
const config = {
  extends: ['./.eslintrc.custom-rules-added-react.js'],
  root: true,
  settings: {
    react: {
      version: 'detect',
    },
  },
};

module.exports = config;
