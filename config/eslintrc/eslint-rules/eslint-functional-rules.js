'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-functional-rules").EslintFunctionalRules } EslintFunctionalRules */

/** @typedef { import("../../types/types").ImmutableDataOptions } ImmutableDataOptions */
/** @typedef { import("../../types/types").NoLetOptions } NoLetOptions */
/** @typedef { import("../../types/types").PreferReadonlyTypeOptions } PreferReadonlyTypeOptions */
/** @typedef { import("../../types/types").PreferTacitOptions } PreferTacitOptions */

const ignorePattern = [
  '^draft', // allow immer.js draft object
  '^mut_',
  '^_mut_',
];

/** @type {ImmutableDataOptions} */
const immutableDataOptions = {
  assumeTypes: true,
  ignoreClass: true,
  ignoreImmediateMutation: true,
  ignorePattern,
  ignoreAccessorPattern: [
    '**.current.**', // allow React Ref object
  ],
};

/** @type {NoLetOptions} */
const noLetOptions = {
  allowInForLoopInit: true,
  allowLocalMutation: true,
  ignorePattern: ignorePattern.filter((p) => p !== '^draft'),
};

/** @type {PreferReadonlyTypeOptions} */
const preferReadonlyTypeOptions = {
  allowLocalMutation: true,
  allowMutableReturnType: true,
  checkImplicit: false,
  ignoreClass: true,
  ignoreInterface: false,
  ignoreCollections: false,
  ignorePattern,
};

/** @type {PreferTacitOptions} */
const preferTacitOptions = {
  assumeTypes: {
    allowFixer: true,
  },
};

/**
 * @type {EslintFunctionalRules}
 * @link {https://github.com/jonaskello/eslint-plugin-functional}
 */
const eslintFunctionalRules = {
  // No Mutations Rules
  'functional/immutable-data': ['error', immutableDataOptions],
  'functional/no-let': ['error', noLetOptions],
  'functional/no-method-signature': 'error',
  'functional/prefer-readonly-type': ['off', preferReadonlyTypeOptions],

  // No Object-Orientation Rules
  'functional/no-class': 'off',
  'functional/no-mixed-type': 'off', // TODO
  'functional/no-this-expression': 'off', // TODO

  // No Statements Rules
  'functional/no-conditional-statement': 'off',
  'functional/no-expression-statement': 'off',
  'functional/no-loop-statement': 'off',
  'functional/no-return-void': 'off',

  // No Exceptions Rules
  'functional/no-promise-reject': 'off',
  'functional/no-throw-statement': 'off',
  'functional/no-try-statement': 'off',

  // Currying Rules
  'functional/functional-parameters': 'off',

  // Stylistic Rules
  'functional/prefer-tacit': ['error', preferTacitOptions],
};

module.exports = {
  eslintFunctionalRules,
  ignorePattern,
  immutableDataOptions,
  noLetOptions,
  preferReadonlyTypeOptions,
  preferTacitOptions,
};
