'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const { readGitignoreFiles } = require('eslint-gitignore');
const { join } = require('path');
const { plugins } = require('./eslint-plugins');

/** @type {LinterConfig} */
const config = {
  root: true,
  env: { browser: true, node: true, es6: true, 'jest/globals': true },
  plugins: [
    plugins.arrayFunc,
    plugins.functional,
    plugins.import,
    plugins.jest,
    plugins.promise,
    plugins.typescriptEslint,
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
    project: join(__dirname, '../tsconfig/tsconfig.eslint.json'),
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
  ignorePatterns: [...readGitignoreFiles({ cwd: __dirname }), '*.d.ts', '*.js'],
};

module.exports = config;
