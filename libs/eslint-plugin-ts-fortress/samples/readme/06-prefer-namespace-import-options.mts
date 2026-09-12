import { type EslintTsFortressRules } from 'eslint-plugin-ts-fortress';

export const rules = {
  // embed-sample-code-ignore-above
  'ts-fortress/prefer-namespace-import': ['error', { namespaceName: 'tf' }],
  // embed-sample-code-ignore-below
} as const satisfies Partial<EslintTsFortressRules>;
