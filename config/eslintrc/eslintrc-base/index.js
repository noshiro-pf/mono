// @ts-check

'use strict';

const eslintImportsRules = require('./eslint-import-rules');
const eslintReactRules = require('./eslint-react-rules');
const eslintJestRules = require('./eslint-jest-rules');
const eslintNoshiroCustomRules = require('./eslint-noshiro-custom');
const eslintRulesAll = require('./eslint-rules');
const typescriptEslintRules = require('./typescript-eslint-rules');

module.exports = {
  eslintImportsRules,
  eslintReactRules,
  eslintJestRules,
  eslintNoshiroCustomRules,
  eslintRulesAll,
  typescriptEslintRules,
};
