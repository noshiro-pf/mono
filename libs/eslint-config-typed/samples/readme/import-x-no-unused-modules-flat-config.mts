import { defineKnownRules, type FlatConfig } from 'eslint-config-typed';

export default [
  // embed-sample-code-ignore-above
  // eslint.config.mts (excerpt)
  {
    files: ['src/**'],
    rules: defineKnownRules({
      'import-x/no-unused-modules': [
        'error',
        { unusedExports: true, ignoreExports: ['src/entry-point.mts'] },
      ],
    }),
  },
  // embed-sample-code-ignore-below
] satisfies readonly FlatConfig[];
