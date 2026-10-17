// eslint.config.mts
import {
  eslintPluginSynstate,
  type EslintSynstateRules,
} from 'eslint-plugin-synstate';

export default [
  {
    plugins: { synstate: eslintPluginSynstate },
    rules: {
      'synstate/no-unbounded-counter-pipe': 'error',
    } satisfies Partial<EslintSynstateRules>,
  },
];
