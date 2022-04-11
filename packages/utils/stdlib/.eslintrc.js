'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const { plugins } = require('../../../config/eslintrc/eslint-plugins');

/** @type {LinterConfig} */
const config = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  plugins: [
    plugins.arrayFunc,
    plugins.functional,
    plugins.import,
    plugins.jest,
    plugins.promise,
    plugins.unicorn,
    plugins.typescriptEslint,
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: {
      modules: true,
      impliedStrict: true,
    },
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'no-var': 'warn',
    'prefer-const': 'warn',
    '@typescript-eslint/no-explicit-any': [
      'warn',
      {
        fixToUnknown: true,
      },
    ],

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
  ignorePatterns: [],
};

module.exports = config;
