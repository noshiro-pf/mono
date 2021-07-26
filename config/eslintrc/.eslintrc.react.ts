import type { Linter } from 'eslint';
import { eslintReactRules } from './eslintrc-base';

/**
 * https://github.com/yannickcr/eslint-plugin-react
 */
const config: Linter.Config = {
  root: true,
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'plugin:react/all',
    'plugin:react-hooks/recommended',
    './.eslintrc.base.js',
  ],
  plugins: ['react', 'react-hooks'],
  rules: eslintReactRules,
};

module.exports = config;
