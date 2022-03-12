// @ts-check

'use strict';

const eslintImportsRules = require('./eslint-import-rules');
const eslintJestRules = require('./eslint-jest-rules');
const eslintNoshiroCustomRules = require('./eslint-noshiro-custom');
const eslintPromiseRules = require('./eslint-promise-rules');
const eslintReactRules = require('./eslint-react-rules');
const { eslintRulesAll, restrictedImports } = require('./eslint-rules');
const {
  typescriptEslintRules,
  banTypes,
} = require('./typescript-eslint-rules');

module.exports = {
  eslintImportsRules,
  eslintJestRules,
  eslintNoshiroCustomRules,
  eslintPromiseRules,
  eslintReactRules,
  eslintRulesAll,
  typescriptEslintRules,
  restrictedImports,
  banTypes,
};
