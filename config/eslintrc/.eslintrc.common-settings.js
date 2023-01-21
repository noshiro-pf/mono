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
    // plugins.cypress,
    plugins.deprecation,
    plugins.functional,
    plugins.import,
    plugins.jest,
    plugins.promise,
    // plugins.react,
    // plugins.reactHooks,
    plugins.security,
    // plugins.totalFunctions,
    plugins.typescriptEslint,
    plugins.unicorn,
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
      '@typescript-eslint/parser': ['.test.ts', '.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        // project: ['packages/**/tsconfig.json', 'config/tsconfig.json'],
        project: ['packages/**/tsconfig.json'],
      },
      // copied from default config
      node: {
        extensions: [
          '.test.ts',
          '.ts',
          '.cts',
          '.mts',
          '.tsx',
          '.jsx',
          '.js',
          '.cjs',
          '.mjs',
        ],
      },
    },
    // copied from default config
    'import/extensions': ['.jsx', '.js', '.cjs', '.mjs'],
    'import/external-module-folders': ['node_modules', 'node_modules/@types'],
  },
  ignorePatterns: [
    ...readGitignoreFiles({ cwd: __dirname }),
    '*_bs.ts',
    '*.d.ts',

    // configs & scripts
    '.eslintrc.cjs',
    'webpack.*.js',
    'app_directory.js',
    'env.js',
    'paths.js',
    'cypress.config.js',
  ],
};

module.exports = config;
