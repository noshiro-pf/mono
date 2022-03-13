'use strict';

// @ts-check

/** @typedef { import("./rules-record").LinterRulesRecord } LinterRulesRecord */

/** @type {LinterRulesRecord} */
const eslintPromiseRules = {
  'promise/catch-or-return': ['warn', { allowFinally: true }],
  'promise/no-return-wrap': 'warn',
  'promise/param-names': 'warn',
  'promise/always-return': 'off',
  'promise/no-native': 'off',
  'promise/no-nesting': 'warn',
  'promise/no-promise-in-callback': 'warn',
  'promise/no-callback-in-promise': 'warn',
  'promise/avoid-new': 'off',
  'promise/no-new-statics': 'warn',
  'promise/no-return-in-finally': 'warn',
  'promise/valid-params': 'warn',
  'promise/prefer-await-to-then': 'off',
  'promise/prefer-await-to-callbacks': 'off',
};

module.exports = eslintPromiseRules;
