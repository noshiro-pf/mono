import type { Linter } from 'eslint';

export const eslintRulesAll: Readonly<
  Record<'disabledRules' | 'modifiedRules', Partial<Linter.RulesRecord>>
> = {
  modifiedRules: {
    eqeqeq: ['error', 'always', { null: 'ignore' }],
  },
  disabledRules: {
    'capitalized-comments': 'off',
    'consistent-return': 'off',
    'default-case': 'off',
    'func-style': 'off', // on にしてもよいかも
    'id-length': 'off',
    'line-comment-position': 'off',
    'lines-between-class-members': 'off',
    'max-classes-per-file': 'off',
    'max-depth': 'off',
    'max-lines-per-function': 'off',
    'max-lines': 'off',
    'max-params': 'off',
    'max-statements': 'off',
    'multiline-comment-style': 'off',
    'new-cap': 'off',
    'no-bitwise': 'off',
    'no-console': 'off',
    'no-continue': 'off',
    'no-duplicate-imports': 'off',
    'no-else-return': 'off',
    'no-eq-null': 'off', // eqeqeqでnull許容するならoff
    'no-inline-comments': 'off',
    'no-lonely-if': 'off',
    'no-magic-numbers': 'off',
    'no-negated-condition': 'off',
    'no-nested-ternary': 'off',
    'no-ternary': 'off',
    'no-undef-init': 'off',
    'no-undefined': 'off',
    'no-underscore-dangle': 'off',
    'no-warning-comments': 'off',
    'one-var': 'off',
    'prefer-destructuring': 'off',
    'sort-imports': 'off',
    'sort-keys': 'off',
    'sort-vars': 'off',
    'symbol-description': 'off',
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    camelcase: 'off',
    complexity: 'off',
    yoda: 'off',
  },
};
