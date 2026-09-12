import { type EslintTsFortressRules } from 'eslint-plugin-ts-fortress';

export const rules = {
  // embed-sample-code-ignore-above
  'ts-fortress/prefer-schema-over-guard-chain': ['error', { threshold: 4 }],
  // embed-sample-code-ignore-below
} as const satisfies Partial<EslintTsFortressRules>;
