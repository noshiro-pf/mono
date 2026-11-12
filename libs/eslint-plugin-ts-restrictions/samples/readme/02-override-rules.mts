// eslint.config.mts
import {
  eslintPluginTsRestrictions,
  type EslintTsRestrictionsRules,
} from 'eslint-plugin-ts-restrictions';

export default [
  eslintPluginTsRestrictions.configs.recommended,
  {
    files: ['src/legacy/**'],
    rules: {
      'ts-restrictions/function-order': 'off',
      'ts-restrictions/prefer-ternary': 'off',
    } satisfies Partial<EslintTsRestrictionsRules>,
  },
];
