import type { Linter } from 'eslint';

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
  rules: {
    //   'react-hooks/rules-of-hooks': 'error',
    //   'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};

module.exports = config;
