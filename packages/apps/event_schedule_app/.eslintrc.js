'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const {
  restrictedImportsOption,
  banTypes,
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
  eslintNoRestrictedImportsStyledComponentsDef,
} = require('@noshiro/global-styled-components/cjs/eslint-no-restricted-imports-def');

/** @type {LinterConfig} */
const config = {
  extends: '../../../config/eslintrc/.eslintrc.react.js',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/no-restricted-imports': [
      'warn',
      {
        paths: [
          ...restrictedImportsOption.paths,
          eslintNoRestrictedImportsTsUtilsDef,
          eslintNoRestrictedImportsReactUtilsDef,
          eslintNoRestrictedImportsSyncflowDef,
          eslintNoRestrictedImportsSyncflowReactHooksDef,
          eslintNoRestrictedImportsReactDef,
          eslintNoRestrictedImportsStyledComponentsDef,
        ],
      },
    ],
  },
};

module.exports = config;
