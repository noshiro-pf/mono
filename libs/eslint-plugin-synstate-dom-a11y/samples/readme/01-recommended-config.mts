// eslint.config.mts
import tsParser from '@typescript-eslint/parser';
import { eslintPluginSynstateDomA11y } from 'eslint-plugin-synstate-dom-a11y';

export default [
  {
    files: ['src/**/*.tsx'],
    languageOptions: { parser: tsParser },
  },
  {
    // The components written with synstate-dom. Leave out any file jsx-a11y's
    // own preset covers, or every finding there is reported twice.
    files: ['src/**/*.tsx'],
    ...eslintPluginSynstateDomA11y.configs.recommended,
  },
];
