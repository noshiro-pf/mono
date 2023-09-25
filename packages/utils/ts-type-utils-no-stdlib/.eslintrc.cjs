'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

/** @type {LinterConfig} */
const config = {
  extends: '../../../config/eslintrc/.eslintrc.base.js',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-shadow': 'off',
  },
};

module.exports = config;
