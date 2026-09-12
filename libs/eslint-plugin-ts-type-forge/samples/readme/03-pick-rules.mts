// eslint.config.mts
import {
  eslintPluginTsTypeForge,
  type EslintTsTypeForgeRules,
} from 'eslint-plugin-ts-type-forge';

export default [
  {
    plugins: { 'ts-type-forge': eslintPluginTsTypeForge },
    rules: {
      'ts-type-forge/no-side-effect-import': 'error',
      // A rule with options is typed to be given them.
      'ts-type-forge/prefer-canonical-length-constrained-tuple': ['error', {}],
    } satisfies Partial<EslintTsTypeForgeRules>,
  },
];
