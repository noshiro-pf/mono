import type { Linter } from 'eslint';

export const eslintReactRules: Linter.Config['rules'] = {
  /* disabled */
  'react/jsx-uses-react': 'off',
  'react/react-in-jsx-scope': 'off',
  'react/jsx-handler-names': 'off',
  'react/jsx-curly-brace-presence': 'off',
  'react/jsx-max-depth': 'off',
  'react/jsx-boolean-value': 'off',

  /* modified */
  'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
  'react/forbid-component-props': ['error', { forbid: ['className'] }],
  'react/no-array-index-key': 'warn',
  'react/jsx-props-no-spreading': 'warn',
  'react/jsx-sort-props': [
    'warn',
    {
      callbacksLast: true,
      reservedFirst: true,
    },
  ],
};
