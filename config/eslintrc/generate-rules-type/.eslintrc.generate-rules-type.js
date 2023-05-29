'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

/** @type {LinterConfig} */
const config = {
  extends: ['../.eslintrc.common-settings.js'],
  rules: {
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'], // modified
    '@typescript-eslint/consistent-indexed-object-style': 'error',

    // TODO
    // https://github.com/jonaskello/eslint-plugin-functional/blob/master/docs/rules/prefer-readonly-type.md
    'functional/prefer-readonly-type': [
      'warn',
      {
        ignoreCollections: false,
        ignoreClass: 'fieldsOnly',
        // allowMutableReturnType: true,
        // ignorePattern: [],
      },
    ],
  },
};

module.exports = config;
