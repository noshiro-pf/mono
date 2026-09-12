// eslint.config.mts
import {
  eslintPluginTsFortress,
  type EslintTsFortressRules,
} from 'eslint-plugin-ts-fortress';

export default [
  eslintPluginTsFortress.configs.recommended,
  {
    files: ['src/legacy/**'],
    rules: {
      'ts-fortress/prefer-canonical-length-constrained-type': 'off',
    } satisfies Partial<EslintTsFortressRules>,
  },
];
