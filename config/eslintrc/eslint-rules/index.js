// @ts-check

'use strict';

const { eslintImportsRules } = require('./eslint-import-rules');
const { eslintJestRules } = require('./eslint-jest-rules');
const { eslintNoshiroCustomRules } = require('./eslint-noshiro-custom');
const {
  eslintFunctionalRules,
  ignorePattern,
  immutableDataOptions,
  noLetOptions,
  preferReadonlyTypeOptions,
  preferTacitOptions,
} = require('./eslint-functional-rules');
const { eslintPromiseRules } = require('./eslint-promise-rules');
const { eslintUnicornRules } = require('./eslint-unicorn-rules');
const { eslintReactRules } = require('./eslint-react-rules');
const { eslintReactHooksRules } = require('./eslint-react-hooks-rules');
const { eslintArrayFuncRules } = require('./eslint-array-func-rules');
const { eslintRules } = require('./eslint-rules');
const {
  typescriptEslintRules,
  banTypes,
  restrictedImportsOption,
} = require('./typescript-eslint-rules');

module.exports = {
  eslintImportsRules,
  eslintJestRules,
  eslintNoshiroCustomRules,
  eslintPromiseRules,
  eslintUnicornRules,
  eslintReactRules,
  eslintReactHooksRules,
  eslintArrayFuncRules,
  eslintRules,

  /* eslint-functional-rules */
  eslintFunctionalRules,
  ignorePattern,
  immutableDataOptions,
  noLetOptions,
  preferReadonlyTypeOptions,
  preferTacitOptions,

  /* typescript-eslint-rules */
  typescriptEslintRules,
  banTypes,
  restrictedImportsOption,
};
