import type { Linter } from 'eslint';
import { eslintReactRules } from './eslintrc-base';

const config: Linter.Config = {
  root: true,
  settings: {
    react: {
      pragma: 'h',
      version: 'detect',
    },
  },
  extends: [
    'preact',
    'plugin:react/all',
    'plugin:react-hooks/recommended',
    './.eslintrc.base.js',
  ],
  plugins: ['react', 'react-hooks'],
  rules: eslintReactRules,
};

module.exports = config;
