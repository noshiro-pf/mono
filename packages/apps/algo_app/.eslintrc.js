'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const {
  restrictedImportsOption,
} = require('../../../config/eslintrc/eslint-rules');

const {
  eslintNoRestrictedImportsTsUtilsDef,
} = require('@noshiro/global-ts-utils/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsPreactUtilsDef,
} = require('@noshiro/global-preact-utils/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsSyncflowDef,
} = require('@noshiro/global-syncflow/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsSyncflowPreactHooksDef,
} = require('@noshiro/global-syncflow-preact-hooks/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsPreactDef,
} = require('@noshiro/global-preact/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsTinyRouterPreactHooksDef,
} = require('@noshiro/global-tiny-router-preact-hooks/cjs/eslint-no-restricted-imports-def');

/** @type {LinterConfig} */
const config = {
  extends: '../../../config/eslintrc/.eslintrc.preact.js',
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
          eslintNoRestrictedImportsPreactUtilsDef,
          eslintNoRestrictedImportsSyncflowDef,
          eslintNoRestrictedImportsSyncflowPreactHooksDef,
          eslintNoRestrictedImportsPreactDef,
          eslintNoRestrictedImportsTinyRouterPreactHooksDef,
        ],
      },
    ],
  },
};

module.exports = config;
