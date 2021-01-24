import type { Linter } from 'eslint';

const config: Linter.Config = {
  root: true,
  settings: {
    react: {
      pragma: 'h',
      version: 'detect',
    },
  },
  extends: ['preact', './.eslintrc.base.js'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};

module.exports = config;
