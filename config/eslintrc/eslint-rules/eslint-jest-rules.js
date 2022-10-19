'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-jest-rules").EslintJestRules } EslintJestRules */

/** @type {EslintJestRules} */
const eslintJestRules = {
  'jest/consistent-test-it': ['error', { fn: 'test' }],
  'jest/expect-expect': 'error',
  'jest/max-expects': 'off',
  'jest/max-nested-describe': 'error',
  'jest/no-alias-methods': 'error',
  'jest/no-commented-out-tests': 'off',
  'jest/no-conditional-expect': 'error',
  'jest/no-conditional-in-test': 'off',
  'jest/no-deprecated-functions': 'error',
  'jest/no-disabled-tests': 'error',
  'jest/no-done-callback': 'error',
  'jest/no-duplicate-hooks': 'error',
  'jest/no-export': 'off',
  'jest/no-focused-tests': 'error',
  'jest/no-hooks': 'error',
  'jest/no-identical-title': 'error',
  'jest/no-interpolation-in-snapshots': 'error',
  'jest/no-jasmine-globals': 'error',
  'jest/no-large-snapshots': 'error',
  'jest/no-mocks-import': 'error',
  'jest/no-restricted-jest-methods': [
    'error',
    {
      advanceTimersByTime: null,
      spyOn: null,
    },
  ],
  'jest/no-restricted-matchers': [
    'error',
    {
      toBeTruthy: null,
      toBeFalsy: null,
    },
  ],
  'jest/no-standalone-expect': 'error',
  'jest/no-test-prefixes': 'error',
  'jest/no-test-return-statement': 'error',
  'jest/prefer-called-with': 'error',
  'jest/prefer-comparison-matcher': 'error',
  'jest/prefer-each': 'error',
  'jest/prefer-equality-matcher': 'error',
  'jest/prefer-expect-assertions': 'off',
  'jest/prefer-expect-resolves': 'error',
  'jest/prefer-hooks-in-order': 'error',
  'jest/prefer-hooks-on-top': 'error',
  'jest/prefer-lowercase-title': 'off',
  'jest/prefer-mock-promise-shorthand': 'error',
  'jest/prefer-snapshot-hint': 'error',
  'jest/prefer-spy-on': 'error',
  'jest/prefer-strict-equal': 'error',
  'jest/prefer-to-be': 'error',
  'jest/prefer-to-contain': 'error',
  'jest/prefer-to-have-length': 'error',
  'jest/prefer-todo': 'error',
  'jest/require-hook': 'off',
  'jest/require-to-throw-message': 'error',
  'jest/require-top-level-describe': 'off',
  'jest/unbound-method': 'error',
  'jest/valid-describe-callback': 'error',
  'jest/valid-expect-in-promise': 'error',
  'jest/valid-expect': 'error',
  'jest/valid-title': 'off',

  // deprecated
  'jest/no-if': 'off',
};

module.exports = { eslintJestRules };
