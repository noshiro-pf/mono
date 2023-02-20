'use strict';

const { join } = require('node:path');

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

/** @type {LinterConfig} */
const config = {
  extends: '../../../../config/eslintrc/.eslintrc.base.js',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: [join(__dirname, '../../../../'), '.'],
      },
    ],
    'import/no-unused-modules': [
      'error',
      { unusedExports: true, ignoreExports: ['src/index.ts'] },
    ],
  },
};

module.exports = config;
