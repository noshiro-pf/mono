import type { Linter } from 'eslint';
import { readGitignoreFiles } from 'eslint-gitignore';

/**
 *  links
 *   - https://eslint.org/docs/rules/
 *   - https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
 *
 *  last update:
 *   "@typescript-eslint/eslint-plugin": "^4.14.1",
 *   "@typescript-eslint/parser": "^4.14.1",
 *   "eslint": "^7.18.0",
 *   "eslint-config-prettier": "^7.2.0",
 *   "eslint-plugin-import": "^2.22.1",
 *   "eslint-plugin-prettier": "^3.3.1",
 */

const typescriptEslintRules: Readonly<
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
    // '@typescript-eslint/consistent-type-definitions': 'error',  // TODO: enable this
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
    '@typescript-eslint/non-nullable-type-assertion-style': 'error',
    // '@typescript-eslint/prefer-enum-initializers': 'error',  -> unnecessary because I don't use enum.
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    // '@typescript-eslint/prefer-literal-enum-member': 'error',  -> unnecessary because I don't use enum.
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    // '@typescript-eslint/prefer-readonly-parameter-types': 'error',  -> off because false positive
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-ts-expect-error': 'error',
    // '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error', // important
    // '@typescript-eslint/sort-type-union-intersection-members': 'error',
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

const eslintRules: Readonly<{
  additionalRulesNotIncludedInRecommended: {
    possibleErrors: Partial<Linter.RulesRecord>;
    bestPractices: Partial<Linter.RulesRecord>;
    variables: Partial<Linter.RulesRecord>;
    stylisticIssues: Partial<Linter.RulesRecord>;
    ECMAScript6: Partial<Linter.RulesRecord>;
  };
  modifiedRulesIncludedInRecommended: Partial<Linter.RulesRecord>;
  disabledRulesIncludedInRecommended: Partial<Linter.RulesRecord>;
}> = {
  additionalRulesNotIncludedInRecommended: {
    possibleErrors: {
      'no-await-in-loop': 'error',
      // 'no-console': 'error',
      // 'no-extra-parens': 'error',  -> scope of prettier
      'no-loss-of-precision': 'error',
      'no-promise-executor-return': 'error',
      // 'no-template-curly-in-string': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-useless-backreference': 'error',
      'require-atomic-updates': 'error',
    },
    bestPractices: {
      'accessor-pairs': 'error',
      'array-callback-return': ['error', { checkForEach: true }],
      // 'block-scoped-var': 'error',
      'class-methods-use-this': 'error',
      // complexity: 'error',
      'consistent-return': 'off',
      curly: 'off',
      // 'default-case': 'error',
      'default-case-last': 'error',
      'default-param-last': 'error',
      // 'dot-location': 'error',  -> scope of prettier
      'dot-notation': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'grouped-accessor-pairs': ['error', 'getBeforeSet'],
      'guard-for-in': 'error',
      // 'max-classes-per-file': 'error',
      'no-alert': 'error',
      'no-caller': 'error',
      'no-constructor-return': 'error',
      // 'no-div-regex': 'error',
      'no-else-return': 'off',
      // 'no-empty-function': 'error',
      // 'no-eq-null': 'error',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-label': 'error', // is unnecessary if no-labels is enabled?
      'no-floating-decimal': 'error',
      'no-implicit-coercion': 'error',
      // 'no-implicit-globals': 'error',
      // 'no-implied-eval': 'error',
      'no-invalid-this': 'error',
      'no-iterator': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-loop-func': 'error',
      'no-magic-numbers': 'off',
      // 'no-multi-spaces': 'error',  -> scope of prettier
      'no-multi-str': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-octal-escape': 'error',
      'no-param-reassign': 'error',
      'no-proto': 'error',
      'no-restricted-properties': 'error',
      'no-return-assign': 'error',
      'no-return-await': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      // 'no-throw-literal': 'error',  -> unnecessary in favor of prefer-promise-reject-errors
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-void': 'error',
      'no-warning-comments': 'off',
      'prefer-named-capture-group': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-regex-literals': 'error',
      radix: 'error',
      'require-await': 'error',
      'require-unicode-regexp': 'error',
      'vars-on-top': 'error',
      'wrap-iife': 'error',
      // yoda: 'error',
    },
    variables: {
      'init-declarations': 'off',
      'no-label-var': 'error',
      'no-restricted-globals': 'error',
      'no-shadow': 'off',
      // 'no-undef-init': 'error',
      'no-undefined': 'off',
      // 'no-use-before-define': 'error',
    },
    stylisticIssues: {
      'no-plusplus': 'error',
      'no-unneeded-ternary': 'error',
      'prefer-exponentiation-operator': 'error',
    },
    ECMAScript6: {
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
    },
  },
  modifiedRulesIncludedInRecommended: {},
  disabledRulesIncludedInRecommended: {},
};

// quotes: ['error', 'single', { avoidEscape: true }],

const config: Linter.Config = {
  root: true,
  env: { browser: true, node: true, es6: true },
  plugins: [
    '@typescript-eslint',
    /* functional, total-functions */
    // 'functional',
    // 'total-functions',
  ],
  extends: [
    /* recommended */
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',

    /* prettier */
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',

    /* functional, total-functions */
    // 'plugin:functional/recommended',
    // 'plugin:functional/external-recommended',
    // 'plugin:total-functions/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './config/tsconfig.eslint.json',
  },
  rules: {
    ...eslintRules.additionalRulesNotIncludedInRecommended.possibleErrors,
    ...eslintRules.additionalRulesNotIncludedInRecommended.bestPractices,
    ...eslintRules.additionalRulesNotIncludedInRecommended.variables,
    ...eslintRules.additionalRulesNotIncludedInRecommended.stylisticIssues,
    ...eslintRules.modifiedRulesIncludedInRecommended,
    ...eslintRules.disabledRulesIncludedInRecommended,
    ...typescriptEslintRules.additionalRulesNotIncludedInRecommended,
    ...typescriptEslintRules.modifiedRulesIncludedInRecommended,
    ...typescriptEslintRules.disabledRulesIncludedInRecommended,
  },
  ignorePatterns: readGitignoreFiles({ cwd: __dirname }),
};

module.exports = config;
