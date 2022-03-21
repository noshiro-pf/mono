'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const { readGitignoreFiles } = require('eslint-gitignore');
const { join } = require('path');
const { plugins } = require('./eslint-plugins');

/** @type {LinterConfig} */
const config = {
  root: true,
  env: {
    browser: true,
    node: true,
    'jest/globals': true,
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
      // copied from default config
      node: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
    // copied from default config
    'import/extensions': ['.js', '.jsx'],
    'import/external-module-folders': ['node_modules', 'node_modules/@types'],
  },
  ignorePatterns: [...readGitignoreFiles({ cwd: __dirname }), '*.d.ts', '*.js'],
};

module.exports = config;
