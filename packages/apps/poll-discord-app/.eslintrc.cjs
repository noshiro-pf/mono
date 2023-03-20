'use strict';
// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */
/** @typedef { import("../../../config/eslintrc/eslint-rules/rules-type/typescript-eslint-rules").TypeScriptEslintRules } TypeScriptEslintRules */

const { join } = require('node:path');

const {
  restrictedImportsOption,
} = require('../../../config/eslintrc/eslint-rules');

const { devDependencies } = require('./package.json');

const globalUtils = Object.keys(devDependencies).filter((packageName) =>
  packageName.startsWith('@noshiro/global-')
);

const eslintNoRestrictedImportsDefs = globalUtils.map((packageName) =>
  require(`${packageName}/cjs/eslint-no-restricted-imports-def`)
);

/** @type {TypeScriptEslintRules["@typescript-eslint/no-restricted-imports"]} */
const noRestrictedImports = [
  'warn',
  {
    paths: [...restrictedImportsOption.paths, ...eslintNoRestrictedImportsDefs],
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
    'import/no-unused-modules': [
      'error',
      { unusedExports: true, ignoreExports: ['src/index.ts'] },
    ],

    '@typescript-eslint/no-restricted-imports': noRestrictedImports,
  },
};

module.exports = config;
