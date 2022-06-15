'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

/** @type {LinterConfig} */
const config = {
  extends: '../../.eslintrc.base.js',
  parserOptions: {
    project: '../../../tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};

module.exports = config;
