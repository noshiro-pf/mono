import { type EslintReactCodingStyleRules } from '../types/index.mjs';

export const eslintReactCodingStyleRules = {
  // import-x/prefer-namespace-import checks similar things, but this rule enforces more strict style.
  'react-coding-style/import-style': ['error', { importStyle: 'namespace' }],

  'react-coding-style/component-name': ['error', { maxLength: 42 }],
  'react-coding-style/component-var-type-annotation': 'error',
  'react-coding-style/props-type-annotation-style': 'error',
  'react-coding-style/react-memo-props-argument-name': 'error',
  'react-coding-style/react-memo-type-parameter': 'error',
  'react-coding-style/ban-use-imperative-handle-hook': 'error',
  'react-coding-style/use-memo-hook-style': 'error',
  'react-coding-style/display-name': ['error', {}],
} as const satisfies EslintReactCodingStyleRules;
