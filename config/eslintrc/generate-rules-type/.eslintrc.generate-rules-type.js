'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const { preferReadonlyTypeOptions } = require('../eslint-rules');

/** @type {LinterConfig} */
const config = {
  extends: ['../.eslintrc.common-settings.js'],
  rules: {
    'functional/prefer-readonly-type': ['warn', preferReadonlyTypeOptions],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'], // modified
    '@typescript-eslint/consistent-indexed-object-style': 'error',
  },
};

module.exports = config;
