import type { Linter } from 'eslint';

export const typescriptEslintRules: Readonly<
  Record<
    | 'additionalRulesNotIncludedInRecommended'
    | 'modifiedRulesIncludedInRecommended'
    | 'disabledRulesIncludedInRecommended',
    Partial<Linter.RulesRecord>
  >
> = {
  additionalRulesNotIncludedInRecommended: {
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/ban-tslint-comment': 'error',
    // '@typescript-eslint/class-literal-property-style': 'error',
    '@typescript-eslint/consistent-indexed-object-style': 'error',
    '@typescript-eslint/consistent-type-assertions': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    // '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    // '@typescript-eslint/explicit-member-accessibility': 'error',
    // '@typescript-eslint/member-delimiter-style': 'error',  -> scope of prettier
    // '@typescript-eslint/member-ordering': 'error', -> off
    '@typescript-eslint/method-signature-style': 'error',
    // '@typescript-eslint/naming-convention': 'error',
    '@typescript-eslint/no-base-to-string': 'error',
    '@typescript-eslint/no-confusing-non-null-assertion': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/no-dynamic-delete': 'error',
    '@typescript-eslint/no-extraneous-class': 'error',
    '@typescript-eslint/no-implicit-any-catch': 'error',
    '@typescript-eslint/no-invalid-void-type': 'error',
    '@typescript-eslint/no-parameter-properties': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    // '@typescript-eslint/no-type-alias': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    // '@typescript-eslint/no-unnecessary-condition': 'error',  -> unnecessary in favor of strict-boolean-expressions
    '@typescript-eslint/no-unnecessary-qualifier': 'error', // maybe unnecessary
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    '@typescript-eslint/no-unnecessary-type-constraint': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/non-nullable-type-assertion-style': 'error',
    // '@typescript-eslint/prefer-enum-initializers': 'error',  -> unnecessary because I don't use enum.
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    // '@typescript-eslint/prefer-literal-enum-member': 'error',  -> unnecessary because I don't use enum.
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    // '@typescript-eslint/prefer-readonly-parameter-types': [
    //   'error',
    //   { checkParameterProperties: false, ignoreInferredTypes: true },
    // ],  -> off because this reports many difficult-to-fix errors
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-ts-expect-error': 'error',
    // '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error', // important
    '@typescript-eslint/sort-type-union-intersection-members': 'error',
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
      },
    ], // important
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    // '@typescript-eslint/type-annotation-spacing': 'error',  -> scope of prettier
    // '@typescript-eslint/typedef': 'error',  -> unnecessary if noImplicitAny and/or strictPropertyInitialization is enabled.
    '@typescript-eslint/unified-signatures': 'error',
  },
  modifiedRulesIncludedInRecommended: {
    '@typescript-eslint/restrict-plus-operands': [
      'error',
      { checkCompoundAssignments: true },
    ],
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowNumber: true, allowBoolean: true, allowNullable: true },
    ],
  },
  disabledRulesIncludedInRecommended: {
    'no-unused-vars': ['off'],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // '@typescript-eslint/no-unused-vars-experimental': [
    //   'error',
    //   {
    //     ignoredNamesRegex: '^_',
    //     ignoreArgsIfArgsAfterAreUsed: true,
    //   },
    // ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-namespace': 'off',
    // 'no-explicit-any': 'off',
    // '@typescript-eslint/no-explicit-any': 'off',
  },
};
