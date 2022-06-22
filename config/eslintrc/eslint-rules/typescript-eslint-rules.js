'use strict';

// @ts-check

/** @typedef { import("./rules-type/typescript-eslint-rules").TypeScriptEslintRules } TypeScriptEslintRules */
/** @typedef { import("../../types/types").RestrictedImportsOption} RestrictedImportsOption */

/** @type {Record<string, { message?: string; fixWith?: string; }>} */
const banTypes = {
  Omit: {
    message: 'Use `StrictOmit` instead.',
    fixWith: 'StrictOmit',
  },
  Exclude: {
    message: 'Use `StrictExclude` instead.',
    fixWith: 'StrictExclude',
  },
  Date: {
    message: 'Use `IDate` from @noshiro/ts-utils instead.',
    fixWith: 'IDate',
  },
  Set: {
    message: 'Use `ISet` or `MutableSet` from @noshiro/ts-utils instead.',
  },
  Map: {
    message: 'Use `IMap` or `MutableMap` from @noshiro/ts-utils instead.',
  },
  JSON: {
    message: 'Use `Json` from @noshiro/ts-utils instead.',
  },
};

const restrictedImportsOption = {
  paths: [
    {
      name: 'react',
      importNames: ['memo'],
      message: 'use memoNamed from @noshiro/react-utils instead.',
    },
    {
      name: 'preact/compat',
      importNames: ['memo'],
      message: 'use memoNamed from @noshiro/preact-utils instead.',
    },
    {
      name: 'react',
      importNames: ['useState'],
      message: 'use useState from @noshiro/react-utils instead.',
    },
    {
      name: 'preact/hooks',
      importNames: ['useState'],
      message: 'use useState from @noshiro/preact-utils instead.',
    },
    {
      name: 'preact/compat',
      importNames: [
        'useState',
        'useReducer',
        'useMemo',
        'useCallback',
        'useRef',
        'useContext',
        'useEffect',
        'useLayoutEffect',
        'useErrorBoundary',
      ],
      message: 'use preact/hooks package instead.',
    },
  ],
};

/** @type {TypeScriptEslintRules} */
const typescriptEslintRules = {
  /**
   * disable in favor of prettier
   * @link https://github.com/prettier/eslint-config-prettier/blob/main/index.js
   */
  '@typescript-eslint/quotes': 'off',
  '@typescript-eslint/brace-style': 'off',
  '@typescript-eslint/comma-dangle': 'off',
  '@typescript-eslint/comma-spacing': 'off',
  '@typescript-eslint/func-call-spacing': 'off',
  '@typescript-eslint/indent': 'off',
  '@typescript-eslint/keyword-spacing': 'off',
  '@typescript-eslint/member-delimiter-style': 'off',
  '@typescript-eslint/no-extra-parens': 'off',
  '@typescript-eslint/no-extra-semi': 'off',
  '@typescript-eslint/object-curly-spacing': 'off',
  '@typescript-eslint/semi': 'off',
  '@typescript-eslint/space-before-blocks': 'off',
  '@typescript-eslint/space-before-function-paren': 'off',
  '@typescript-eslint/space-infix-ops': 'off',
  '@typescript-eslint/type-annotation-spacing': 'off',

  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/array-type': 'error',
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/ban-tslint-comment': 'error',
  '@typescript-eslint/ban-types': [
    'error',
    { types: banTypes, extendDefaults: true },
  ], // modified
  '@typescript-eslint/class-literal-property-style': 'error',
  '@typescript-eslint/consistent-indexed-object-style': 'error',
  '@typescript-eslint/consistent-type-assertions': 'error',
  '@typescript-eslint/consistent-type-definitions': ['error', 'type'], // modified
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/consistent-type-exports': 'error',
  '@typescript-eslint/default-param-last': 'error',
  '@typescript-eslint/dot-notation': [
    'error',
    { allowIndexSignaturePropertyAccess: true },
  ], // modified
  '@typescript-eslint/explicit-function-return-type': [
    'error',
    {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    },
  ], // modified
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    { accessibility: 'no-public' },
  ], // modified
  '@typescript-eslint/explicit-module-boundary-types': 'off', // preferred to use explicit-function-return-type
  '@typescript-eslint/init-declarations': 'error',
  '@typescript-eslint/lines-between-class-members': 'off', // disabled
  '@typescript-eslint/member-ordering': 'off', // disabled
  '@typescript-eslint/method-signature-style': 'error',
  '@typescript-eslint/naming-convention': 'off', // disabled
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-base-to-string': 'error',
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-confusing-void-expression': 'error',
  '@typescript-eslint/no-dupe-class-members': 'error',
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-function': 'error',
  '@typescript-eslint/no-empty-interface': 'off', // disabled
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-extraneous-class': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-for-in-array': 'error',
  '@typescript-eslint/no-implied-eval': 'error',
  '@typescript-eslint/no-inferrable-types': 'off', // disabled
  '@typescript-eslint/no-invalid-this': 'error',
  '@typescript-eslint/no-invalid-void-type': 'error',
  '@typescript-eslint/no-loop-func': 'error',
  '@typescript-eslint/no-loss-of-precision': 'error',
  '@typescript-eslint/no-magic-numbers': 'off', // disabled
  '@typescript-eslint/no-meaningless-void-operator': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-misused-promises': 'error', // modified
  '@typescript-eslint/no-namespace': 'off', // disabled
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/no-redeclare': 'off', // disabled
  '@typescript-eslint/no-redundant-type-constituents': 'error', // modified
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/no-restricted-imports': [
    // modified
    'error',
    restrictedImportsOption,
  ],
  '@typescript-eslint/no-shadow': [
    'error',
    {
      builtinGlobals: true,
      hoist: 'all',
      ignoreTypeValueShadow: false,
      ignoreFunctionTypeParameterNameValueShadow: false,
    },
  ], // modified
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-throw-literal': 'error',
  '@typescript-eslint/no-type-alias': 'off', // disabled
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
  '@typescript-eslint/no-unnecessary-condition': [
    'error',
    { allowConstantLoopConditions: true },
  ], // modified
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'off', // disabled
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/no-unused-expressions': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      args: 'after-used',
    },
  ], // modified
  '@typescript-eslint/no-use-before-define': 'off', // disabled
  '@typescript-eslint/no-useless-empty-export': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/no-var-requires': 'error',
  '@typescript-eslint/non-nullable-type-assertion-style': 'error',
  '@typescript-eslint/padding-line-between-statements': 'error',
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/prefer-enum-initializers': 'error',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/prefer-includes': 'error',
  '@typescript-eslint/prefer-literal-enum-member': 'error',
  '@typescript-eslint/prefer-namespace-keyword': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/prefer-readonly-parameter-types': [
    'error',
    {
      checkParameterProperties: true,
      ignoreInferredTypes: true,
      treatMethodsAsReadonly: true,
    },
  ], // modified
  '@typescript-eslint/prefer-reduce-type-parameter': 'error',
  '@typescript-eslint/prefer-regexp-exec': 'error',
  '@typescript-eslint/prefer-return-this-type': 'error',
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',
  '@typescript-eslint/prefer-ts-expect-error': 'error',
  '@typescript-eslint/promise-function-async': 'off', // disabled
  '@typescript-eslint/require-array-sort-compare': 'error',
  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/restrict-plus-operands': [
    'error',
    { checkCompoundAssignments: true },
  ], // modified
  '@typescript-eslint/restrict-template-expressions': [
    'error',
    { allowNumber: true, allowBoolean: true, allowNullable: true },
  ], // modified
  '@typescript-eslint/return-await': 'error',
  '@typescript-eslint/sort-type-union-intersection-members': 'error',
  '@typescript-eslint/strict-boolean-expressions': [
    'error',
    { allowString: false, allowNumber: false, allowNullableObject: false },
  ], // modified
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/triple-slash-reference': 'error',
  '@typescript-eslint/typedef': 'error',
  '@typescript-eslint/unbound-method': 'error',
  '@typescript-eslint/unified-signatures': 'error',

  '@typescript-eslint/consistent-generic-constructors': 'error',
  '@typescript-eslint/no-duplicate-enum-values': 'error',
  '@typescript-eslint/parameter-properties': 'error',

  // deprecated
  '@typescript-eslint/no-duplicate-imports': 'off', // deprecated
  '@typescript-eslint/no-parameter-properties': 'off', // deprecated
  '@typescript-eslint/no-implicit-any-catch': 'off',
};

module.exports = { typescriptEslintRules, banTypes, restrictedImportsOption };
