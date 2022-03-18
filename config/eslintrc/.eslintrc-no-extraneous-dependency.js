'use strict';

// @ts-check

const { join } = require('path');
const { plugins } = require('./eslint-plugins');

/** @typedef { import("eslint").Linter.Config } LinterConfig */

/** @type {LinterConfig} */
const config = {
  extends: './.eslintrc.common-settings.js',
  plugins: [plugins.react, plugins.reactHooks],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: [join(__dirname, '../../'), '.'],
      },
    ],
  },
};

module.exports = config;
