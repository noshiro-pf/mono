'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

/** @type {LinterConfig} */
const config = {
  extends: ['../.eslintrc.common-settings.js'],
  rules: {
    // TODO
    // 'functional/prefer-readonly-type': ['warn', preferReadonlyTypeOptions],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'], // modified
    '@typescript-eslint/consistent-indexed-object-style': 'error',
  },
};

module.exports = config;
