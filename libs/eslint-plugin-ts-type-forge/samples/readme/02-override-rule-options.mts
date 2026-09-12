// eslint.config.mts
import {
  eslintPluginTsTypeForge,
  type EslintTsTypeForgeRules,
} from 'eslint-plugin-ts-type-forge';

export default [
  eslintPluginTsTypeForge.configs.recommended,
  {
    rules: {
      'ts-type-forge/prefer-canonical-length-constrained-tuple': [
        'error',
        { importStyle: 'global' },
      ],
    } satisfies Partial<EslintTsTypeForgeRules>,
  },
];
