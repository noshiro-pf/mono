'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-deprecation-rules").EslintDeprecationRules } EslintDeprecationRules */

/** @type {EslintDeprecationRules} */
const eslintDeprecationRules = {
  'deprecation/deprecation': 'error',
};

module.exports = { eslintDeprecationRules };
