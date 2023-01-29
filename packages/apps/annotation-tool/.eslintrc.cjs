'use strict';
// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */
/** @typedef { import("../../../config/eslintrc/eslint-rules/rules-type/typescript-eslint-rules").TypeScriptEslintRules } TypeScriptEslintRules */

const {
  restrictedImportsOption,
} = require('../../../config/eslintrc/eslint-rules');

const {
  eslintNoRestrictedImportsTsUtilsDef,
} = require('@noshiro/global-ts-utils/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsReactUtilsDef,
} = require('@noshiro/global-react-utils/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsSyncflowDef,
} = require('@noshiro/global-syncflow/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsSyncflowReactHooksDef,
} = require('@noshiro/global-syncflow-react-hooks/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsReactDef,
} = require('@noshiro/global-react/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsTinyRouterReactHooksDef,
} = require('@noshiro/global-tiny-router-react-hooks/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsStyledComponentsDef,
} = require('@noshiro/global-styled-components/cjs/eslint-no-restricted-imports-def');

const { join } = require('path');

/** @type {TypeScriptEslintRules["@typescript-eslint/no-restricted-imports"]} */
const noRestrictedImports = [
  'warn',
  {
    paths: [
      ...restrictedImportsOption.paths,
      eslintNoRestrictedImportsTsUtilsDef,
      eslintNoRestrictedImportsReactUtilsDef,
      eslintNoRestrictedImportsSyncflowDef,
      eslintNoRestrictedImportsSyncflowReactHooksDef,
      eslintNoRestrictedImportsReactDef,
      eslintNoRestrictedImportsTinyRouterReactHooksDef,
      eslintNoRestrictedImportsStyledComponentsDef,
    ],
  },
];

/** @type {LinterConfig} */
const config = {
  extends: '../../../config/eslintrc/.eslintrc.react.js',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: [join(__dirname, '../../../'), '.'],
      },
    ],
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    '@typescript-eslint/no-restricted-imports': noRestrictedImports,
    '@typescript-eslint/no-namespace': 'error', // enable in Vite project
  },
};

module.exports = config;
