'use strict';

// @ts-check

/** @typedef { import("./rules-record").LinterRulesRecord } LinterRulesRecord */

/** @typedef { import("./rules-record").ImmutableDataOptions } ImmutableDataOptions */
/** @typedef { import("./rules-record").NoLetOptions } NoLetOptions */
/** @typedef { import("./rules-record").PreferReadonlyTypeOptions } PreferReadonlyTypeOptions */

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
 * @type {LinterRulesRecord}
 * @link {https://github.com/jonaskello/eslint-plugin-functional}
 */
const eslintFunctionalRules = {
  // No Mutations Rules
  'functional/immutable-data': ['warn', immutableDataOptions],
  'functional/no-let': ['warn', noLetOptions],
  'functional/no-method-signature': 'warn',
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
  'functional/prefer-tacit': ['warn', preferTacitOptions],
};

module.exports = eslintFunctionalRules;
