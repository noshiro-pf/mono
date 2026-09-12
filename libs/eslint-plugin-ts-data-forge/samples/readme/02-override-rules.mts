// eslint.config.mts
import {
  eslintPluginTsDataForge,
  type EslintTsDataForgeRules,
} from 'eslint-plugin-ts-data-forge';

export default [
  eslintPluginTsDataForge.configs.recommended,
  {
    rules: {
      'ts-data-forge/prefer-range-for-loop': 'off',
    } satisfies Partial<EslintTsDataForgeRules>,
  },
];
