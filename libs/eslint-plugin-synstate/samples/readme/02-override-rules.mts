// eslint.config.mts
import {
  eslintPluginSynstate,
  type EslintSynstateRules,
} from 'eslint-plugin-synstate';

export default [
  eslintPluginSynstate.configs.recommended,
  {
    files: ['**/*.test.mts'],
    rules: {
      'synstate/no-unbounded-counter-pipe': 'off',
    } satisfies Partial<EslintSynstateRules>,
  },
];
