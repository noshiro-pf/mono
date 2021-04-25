import type { Linter } from 'eslint';

export const eslintRules: Readonly<{
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
      'no-implicit-coercion': ['error', { disallowTemplateShorthand: true }],
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
      'no-sequences': ['error', { allowInParentheses: false }],
      // 'no-throw-literal': 'error',  -> unnecessary in favor of prefer-promise-reject-errors
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': ['error', { enforceForJSX: false }],
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-void': 'error',
      'no-warning-comments': 'off',
      'prefer-named-capture-group': 'off',
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
      'no-shadow': 'error',
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
