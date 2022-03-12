'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const { readGitignoreFiles } = require('eslint-gitignore');
const {
  eslintImportsRules,
  eslintJestRules,
  eslintNoshiroCustomRules,
  eslintRulesAll,
  typescriptEslintRules,
  eslintPromiseRules,
} = require('./eslintrc-base');

/**
 *  - mono/docs/linter-formatter-update-manual.md
 *  - links
 *    - https://eslint.org/docs/rules/
 *    - https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
 *
 *  - last update:
 *    - "@types/eslint": "^7.2.10",
 *    - "@typescript-eslint/eslint-plugin": "^4.26.0",
 *    - "@typescript-eslint/parser": "^4.26.0",
 *    - "babel-eslint": "^10.1.0",
 *    - "eslint": "^7.25.0",
 *    - "eslint-config-preact": "^1.1.3",
 *    - "eslint-config-prettier": "^8.3.0",
 *    - "eslint-gitignore": "^0.1.0",
 *    - "eslint-plugin-functional": "^3.2.1",
 *    - "eslint-plugin-import": "^2.22.1",
 *    - "eslint-plugin-react": "^7.23.2",
 *    - "eslint-plugin-react-hooks": "^4.2.0",
 *    - "eslint-plugin-total-functions": "^4.7.2",
 *    - "eslint-config-prettier": "^8.3.0",
 *    - "prettier": "^2.3.2",
 *    - "prettier-plugin-organize-imports": "^2.1.0",
 *    - "prettier-plugin-packagejson": "^2.2.10",
 */

// quotes: ['error', 'single', { avoidEscape: true }],

/** @type {LinterConfig} */
const config = {
  extends: [
    /* recommended */
    'eslint:all',
    'plugin:@typescript-eslint/all',

    /* import */
    'plugin:import/recommended',
    // 'plugin:import/errors',
    // 'plugin:import/warnings',
    'plugin:import/typescript', // needs eslint-import-resolver-typescript to be installed
    'plugin:import/react',
    'plugin:noshiro-custom/all',

    /* functional, total-functions */
    // 'plugin:functional/recommended',
    // 'plugin:functional/external-recommended',
    // 'plugin:total-functions/recommended',

    /* jest */
    'plugin:jest/all',
    // 'plugin:jest/recommended',

    /* array-func */
    'plugin:array-func/all',
    // 'plugin:array-func/recommended',

    /* prettier */
    'prettier', // turn off rules
  ],
  root: true,
  env: { browser: true, node: true, es6: true, 'jest/globals': true },
  plugins: [
    '@typescript-eslint',
    'import',
    'jest',
    'array-func',
    'promise',
    'noshiro-custom',
    /* functional, total-functions */
    // 'functional',
    // 'total-functions',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      modules: true,
      impliedStrict: true,
      jsx: true,
    },
    sourceType: 'module',
    project: 'config/tsconfig/tsconfig.eslint.json',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        project: 'packages/**/tsconfig.json',
      },
    },
  },
  rules: {
    ...eslintRulesAll.modifiedRules,
    ...eslintRulesAll.disabledRules,
    ...typescriptEslintRules.modifiedRules,
    ...typescriptEslintRules.disabledRules,
    ...eslintImportsRules.staticAnalysis,
    ...eslintImportsRules.helpfulWarnings,
    ...eslintImportsRules.moduleSystems,
    ...eslintImportsRules.styleGuide,
    ...eslintJestRules,
    ...eslintPromiseRules,
    ...eslintNoshiroCustomRules,
  },
  ignorePatterns: [...readGitignoreFiles({ cwd: __dirname }), '*.d.ts', '*.js'],
};

module.exports = config;
