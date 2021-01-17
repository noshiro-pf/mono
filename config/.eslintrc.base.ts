import type { Linter } from 'eslint';
import { readGitignoreFiles } from 'eslint-gitignore';

const config: Linter.Config = {
  env: { browser: true, node: true, es6: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: '../tsconfig.eslint.json',
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/camelcase': 'off',

    /* no-explicit-any */
    'no-explicit-any': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    /* no-unused-vars */
    // 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': 'error',
    'no-unused-vars': ['off'],

    'no-console': 'off',

    /* no-use-before-define */
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',

    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowNumber: true, allowBoolean: true, allowNullable: true },
    ],
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-namespace': 'off',
  },
  ignorePatterns: readGitignoreFiles({ cwd: __dirname }),
};

module.exports = config;
