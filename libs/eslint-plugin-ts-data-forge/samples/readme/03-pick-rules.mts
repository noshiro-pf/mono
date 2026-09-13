// eslint.config.mts
import {
  eslintPluginTsDataForge,
  type EslintTsDataForgeRules,
} from 'eslint-plugin-ts-data-forge';

export default [
  {
    plugins: { 'ts-data-forge': eslintPluginTsDataForge },
    rules: {
      'ts-data-forge/prefer-canonical-length-guard': 'error',
      'ts-data-forge/prefer-canonical-length-cast': 'error',
      'ts-data-forge/prefer-is-record-and-has-key': 'error',
      // ...enable the rules you want
    } satisfies Partial<EslintTsDataForgeRules>,
  },
];
