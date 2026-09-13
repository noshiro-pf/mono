// eslint.config.mts
import {
  eslintPluginTsStdForge,
  type EslintTsStdForgeRules,
} from 'eslint-plugin-ts-std-forge';

export default [
  {
    plugins: { 'ts-std-forge': eslintPluginTsStdForge },
    rules: {
      'ts-std-forge/prefer-is-record-and-has-key': 'error',
      'ts-std-forge/prefer-safe-array-is-array': 'error',
      // ...enable the rules you want
    } satisfies Partial<EslintTsStdForgeRules>,
  },
];
