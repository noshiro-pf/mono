// eslint.config.mts
import {
  eslintPluginTsUiRestrictions,
  type EslintTsUiRestrictionsRules,
} from 'eslint-plugin-ts-ui-restrictions';

export default [
  eslintPluginTsUiRestrictions.configs.recommended,
  {
    rules: {
      'ts-ui-restrictions/require-ime-guard': [
        'error',
        { guardFunctions: ['isImeKeyDown', 'isComposingKey'], keys: ['Enter'] },
      ],
    } satisfies Partial<EslintTsUiRestrictionsRules>,
  },
];
