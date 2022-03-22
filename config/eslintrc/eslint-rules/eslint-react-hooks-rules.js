'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-react-hooks-rules").EslintReactHooksRules } EslintReactHooksRules */

/** @type {EslintReactHooksRules} */
const eslintReactHooksRules = {
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'error',
};

module.exports = { eslintReactHooksRules };
