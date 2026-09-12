// eslint.config.mts
import {
  eslintPluginTsStdForge,
  type EslintTsStdForgeRules,
} from 'eslint-plugin-ts-std-forge';

export default [
  eslintPluginTsStdForge.configs.recommended,
  {
    rules: {
      'ts-std-forge/prefer-safe-array-length-guard': 'off',
    } satisfies Partial<EslintTsStdForgeRules>,
  },
];
