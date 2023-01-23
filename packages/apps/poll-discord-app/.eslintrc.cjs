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
  eslintNoRestrictedImportsSyncflowDef,
} = require('@noshiro/global-syncflow/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsGooberDef,
} = require('@noshiro/global-goober/cjs/eslint-no-restricted-imports-def');

const { join } = require('path');

/** @type {TypeScriptEslintRules["@typescript-eslint/no-restricted-imports"]} */
const noRestrictedImports = [
  'warn',
  {
    paths: [
      ...restrictedImportsOption.paths,
      eslintNoRestrictedImportsTsUtilsDef,
      eslintNoRestrictedImportsSyncflowDef,
      eslintNoRestrictedImportsGooberDef,
    ],
  },
];

/** @type {LinterConfig} */
const config = {
  extends: '../../../config/eslintrc/.eslintrc.base.js',
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
    '@typescript-eslint/no-restricted-imports': noRestrictedImports,
  },
};

module.exports = config;
