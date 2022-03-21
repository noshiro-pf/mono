'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-array-func-rules").EslintArrayFuncRules } EslintArrayFuncRules */

/** @type {EslintArrayFuncRules} */
const eslintArrayFuncRules = {
  'array-func/from-map': 'error',
  'array-func/no-unnecessary-this-arg': 'error',
  'array-func/prefer-array-from': 'error',
  'array-func/avoid-reverse': 'error',
  'array-func/prefer-flat-map': 'error',
  'array-func/prefer-flat': 'error',
};

module.exports = { eslintArrayFuncRules };
