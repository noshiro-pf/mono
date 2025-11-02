// configs/restricted-syntax-defs.mjs

import { eslintRules, type EslintRulesOption } from 'eslint-config-typed';

export const restrictedSyntax = [
  ...eslintRules['no-restricted-syntax'].slice(1),
  {
    // Restrict type annotation style for React.useMemo
    selector:
      "TSTypeAnnotation[parent.parent.type='CallExpression'][parent.parent.callee.object.name='React'][parent.parent.callee.property.name='useMemo']",
    message:
      'The variable type T should be annotated as `React.useMemo<T>` or `const v: T = React.useMemo(...)`.',
  },
] satisfies EslintRulesOption['no-restricted-syntax'];
