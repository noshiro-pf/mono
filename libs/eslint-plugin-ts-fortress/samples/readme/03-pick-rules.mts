// eslint.config.mts
import {
  eslintPluginTsFortress,
  type EslintTsFortressRules,
} from 'eslint-plugin-ts-fortress';

export default [
  {
    plugins: { 'ts-fortress': eslintPluginTsFortress },
    rules: {
      'ts-fortress/prefer-canonical-length-constrained-type': 'error',
    } satisfies Partial<EslintTsFortressRules>,
  },
];
