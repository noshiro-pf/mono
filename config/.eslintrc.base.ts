import type { Linter } from 'eslint';
import { readGitignoreFiles } from 'eslint-gitignore';

const config: Linter.Config = {
  root: true,
  env: { browser: true, node: true, es6: true },
  plugins: ['@typescript-eslint', 'functional', 'total-functions'],
  extends: [
    'eslint:recommended',
    // 'plugin:functional/recommended',
    // 'plugin:functional/external-recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
    // 'plugin:total-functions/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './config/tsconfig.eslint.json',
  },
  rules: {
    /**
     * Additional rules that are not part of `eslint:recommended`.
     * See https://eslint.org/docs/rules/
     */
    // eval is completely unsafe from a security point of view, but also from a type-safety point of view.
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-await-in-loop': 'error',
    'no-new-wrappers': 'error',

    // No 90s style coercion.
    // eqeqeq: 'error',
    // 'no-caller': 'error',
    // 'require-unicode-regexp': 'error',
    // 'no-loss-of-precision': 'error',

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
