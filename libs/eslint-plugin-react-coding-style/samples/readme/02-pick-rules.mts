// eslint.config.mts
import {
  eslintPluginReactCodingStyle,
  type EslintReactCodingStyleRules,
} from 'eslint-plugin-react-coding-style';

export default [
  {
    plugins: { 'react-coding-style': eslintPluginReactCodingStyle },
    rules: {
      'react-coding-style/component-var-type-annotation': 'error',
    } satisfies Partial<EslintReactCodingStyleRules>,
  },
];
