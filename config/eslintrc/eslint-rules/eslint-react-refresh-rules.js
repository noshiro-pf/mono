'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-react-refresh-rules").EslintReactRefresh } EslintReactRefresh */

/** @type {EslintReactRefresh} */
const eslintReactRefresh = {
  'react-refresh/only-export-components': 'error',
};

module.exports = { eslintReactRefresh };
