import {
  defineKnownRules,
  eslintRules,
  type FlatConfig,
} from 'eslint-config-typed';

export default [
  // ...
  {
    rules: defineKnownRules({
      'no-restricted-syntax': [
        'warn',
        ...eslintRules['no-restricted-syntax'].slice(1),
      ],
      'ts-restrictions/no-restricted-syntax': [
        'error',
        {
          // Restrict import style of React
          selector:
            "ImportDeclaration[source.value='react'][specifiers.0.type!='ImportNamespaceSpecifier']",
          message:
            "React should be imported as `import * as React from 'react'.",
        },
      ],
    }),
  },
] satisfies readonly FlatConfig[];
