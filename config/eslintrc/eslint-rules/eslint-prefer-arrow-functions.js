'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-prefer-arrow-functions-rules").PreferArrowFunctionRules } PreferArrowFunctionRules */

/** @type {PreferArrowFunctionRules} */
const eslintPreferArrowFunctionRules = {
  'prefer-arrow-functions/prefer-arrow-functions': [
    'error',
    {
      classPropertiesAllowed: false,
      disallowPrototype: false,
      returnStyle: 'unchanged',
      singleReturnOnly: false,
    },
  ],
};

module.exports = { eslintPreferArrowFunctionRules };
