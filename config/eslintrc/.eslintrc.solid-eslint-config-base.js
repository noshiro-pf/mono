'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

/** @type {LinterConfig} */
const config = {
  extends: ['@solid/eslint-config-base', './.eslintrc.base.js'],
};

module.exports = config;
