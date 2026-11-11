// eslint.config.mts
import { eslintPluginReactCodingStyle } from 'eslint-plugin-react-coding-style';

export default [
  {
    ...eslintPluginReactCodingStyle.configs.recommended,
    files: ['**/*.tsx'],
  },
];
