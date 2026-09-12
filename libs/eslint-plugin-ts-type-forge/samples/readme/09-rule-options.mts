import { type EslintTsTypeForgeRules } from 'eslint-plugin-ts-type-forge';

export const rules = {
  // The README renders markdown code blocks with a four-space indent, and a
  // lone property is not a program Prettier can reformat there.
  // prettier-ignore
  // embed-sample-code-ignore-above
  'ts-type-forge/prefer-canonical-length-constrained-tuple': [
      'error',
      { importStyle: 'named', maxLength: 6 },
  ],
  // embed-sample-code-ignore-below
} satisfies Partial<EslintTsTypeForgeRules>;
