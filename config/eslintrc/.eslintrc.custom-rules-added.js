'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const {
  eslintImportsRules,
  eslintJestRules,
  eslintFunctionalRules,
  eslintRules,
  eslintArrayFuncRules,
  typescriptEslintRules,
  eslintPromiseRules,
  eslintUnicornRules,
  // eslintNoshiroCustomRules,
} = require('./eslint-rules');

/** @type {LinterConfig} */
const config = {
  extends: [
    /* recommended */
    // 'eslint:all',
    // 'plugin:@typescript-eslint/all',

    /* import */
    // 'plugin:import/recommended',
    // 'plugin:import/errors',
    // 'plugin:import/warnings',
    // 'plugin:import/typescript', // needs eslint-import-resolver-typescript to be installed
    // 'plugin:import/react',

    /* functional, total-functions */
    // 'plugin:functional/external-recommended',
    // 'plugin:functional/recommended',
    // 'plugin:functional/stylistic',
    // 'plugin:total-functions/recommended',

    /* jest */
    // 'plugin:jest/all',
    // 'plugin:jest/recommended',

    /* array-func */
    // 'plugin:array-func/all',
    // 'plugin:array-func/recommended',

    /* unicorn */
    // 'plugin:unicorn/all',
    // 'plugin:unicorn/recommended',

    './.eslintrc.common-settings.js',
  ],
  rules: {
    ...eslintRules,
    ...eslintImportsRules,
    ...eslintJestRules,
    ...eslintPromiseRules,
    ...eslintFunctionalRules,
    ...eslintUnicornRules,
    ...eslintArrayFuncRules,
    ...typescriptEslintRules,
    // ...eslintNoshiroCustomRules,
  },
};

module.exports = config;
