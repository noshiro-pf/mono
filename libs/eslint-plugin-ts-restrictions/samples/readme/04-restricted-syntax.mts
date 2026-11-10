// eslint.config.mts
import {
  eslintPluginTsRestrictions,
  type EslintTsRestrictionsRules,
} from 'eslint-plugin-ts-restrictions';

export default [
  {
    plugins: { 'ts-restrictions': eslintPluginTsRestrictions },
    rules: {
      'ts-restrictions/no-restricted-syntax': [
        'error',
        'WithStatement',
        {
          selector: "CallExpression[callee.name='eval']",
          message: 'Do not call `eval`.',
        },
      ],
    } satisfies Partial<EslintTsRestrictionsRules>,
  },
];
