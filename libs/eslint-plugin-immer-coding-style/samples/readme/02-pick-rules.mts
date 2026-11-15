// eslint.config.mts
import {
  eslintPluginImmerCodingStyle,
  type EslintImmerCodingStyleRules,
} from 'eslint-plugin-immer-coding-style';

export default [
  {
    plugins: { 'immer-coding-style': eslintPluginImmerCodingStyle },
    rules: {
      'immer-coding-style/prefer-curried-produce': 'error',
    } satisfies Partial<EslintImmerCodingStyleRules>,
  },
];
