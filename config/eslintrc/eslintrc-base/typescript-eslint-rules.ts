import type { Linter } from 'eslint';

export const typescriptEslintRules: Readonly<
  Record<'disabledRules' | 'modifiedRules', Partial<Linter.RulesRecord>>
> = {
  modifiedRules: {
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          Omit: 'Use `StrictOmit` instead.',
          Exclude: 'Use `StrictExclude` instead.',
        },
        extendDefaults: true,
      },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      { accessibility: 'no-public' },
    ],
    '@typescript-eslint/no-shadow': [
      'warn',
      {
        allow: ['Option'],
        builtinGlobals: true,
        hoist: 'all',
        ignoreTypeValueShadow: false,
        ignoreFunctionTypeParameterNameValueShadow: false,
      },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/restrict-plus-operands': [
      'error',
      { checkCompoundAssignments: true },
    ],
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowNumber: true, allowBoolean: true, allowNullable: true },
    ],
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      { allowString: false, allowNumber: false, allowNullableObject: false },
    ],
    '@typescript-eslint/no-unnecessary-condition': [
      'error',
      { allowConstantLoopConditions: true },
    ],
    'dot-notation': 'off',
    '@typescript-eslint/dot-notation': [
      'error',
      {
        allowIndexSignaturePropertyAccess: true,
      },
    ],
  },
  disabledRules: {
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/member-ordering': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    '@typescript-eslint/no-type-alias': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/promise-function-async': 'off',
  },
};
