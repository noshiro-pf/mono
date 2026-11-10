// eslint.config.mts
import {
  eslintPluginTsRestrictions,
  type EslintTsRestrictionsRules,
} from 'eslint-plugin-ts-restrictions';

export default [
  {
    plugins: { 'ts-restrictions': eslintPluginTsRestrictions },
    rules: {
      'ts-restrictions/no-detached-jsdoc': 'error',
      'ts-restrictions/prefer-range-in-number-line-order': 'error',
    } satisfies Partial<EslintTsRestrictionsRules>,
  },
];
