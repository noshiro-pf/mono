// eslint.config.mts
import {
  eslintPluginVitestCodingStyle,
  type EslintVitestCodingStyleRules,
} from 'eslint-plugin-vitest-coding-style';

export default [
  {
    plugins: { 'vitest-coding-style': eslintPluginVitestCodingStyle },
    rules: {
      'vitest-coding-style/prefer-assert-is-true-over-expect-true': 'error',
    } satisfies Partial<EslintVitestCodingStyleRules>,
  },
];
