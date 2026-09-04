import { type EslintStylisticRules } from '../types/index.mjs';

export const eslintStylisticRules = {
  // Rules explicitly disabled by eslint-config-prettier (special handling)
  '@stylistic/lines-around-comment': 'off',
  '@stylistic/max-len': 'off',
  '@stylistic/no-confusing-arrow': 'off',
  '@stylistic/no-mixed-operators': 'off',
  '@stylistic/no-tabs': 'off',
  // The one rule taken back out of this block, and only for the half no
  // formatter covers.
  //
  // eslint-config-prettier turns `quotes` off because the rule *can* disagree
  // with the formatter over which quote a string gets. It cannot disagree here,
  // because it is not asked: `ignoreStringLiterals: true` leaves every quoted
  // string to whatever formatter the project runs, whichever quote that
  // formatter prefers.
  //
  // What no formatter touches is the backtick. Prettier and oxfmt both rewrite
  // `"a"` to `'a'` when configured `singleQuote`, and neither will ever rewrite
  // `` `a` `` into a quoted string — however little of a template is left in
  // it, a template literal survives every format pass. That is what
  // `allowTemplateLiterals: 'never'` reports, and the fix is mechanical.
  //
  // A template is left alone only when `quotes` counts it as using a feature of
  // one: it is tagged, it carries a substitution, or it has a real line break
  // in it. A backtick *inside* is not on that list — `` `a \` b` `` becomes
  // `'a ` b'`, which needs no escape.
  //
  // `avoidEscape` is deliberately absent, and its absence is what keeps this
  // strict. It does nothing on its own here — the string-literal branch returns
  // early under `ignoreStringLiterals` — but set together with
  // `allowTemplateLiterals: 'avoidEscape'` it exempts every template whose text
  // merely *contains* a `'`, which is a far wider net than the escaping it is
  // named for. Measured over this repository that would be 10 of the 68 sites,
  // and not one of them needed an escape: the formatter turned each into an
  // ordinary double-quoted string, which is its job and not this rule's
  // business.
  '@stylistic/quotes': [
    'error',
    'single',
    { allowTemplateLiterals: 'never', ignoreStringLiterals: true },
  ],

  // Rules kept off to mirror eslint-config-prettier ordering
  '@stylistic/array-bracket-newline': 'off',
  '@stylistic/array-bracket-spacing': 'off',
  '@stylistic/array-element-newline': 'off',
  '@stylistic/arrow-parens': 'off',
  '@stylistic/arrow-spacing': 'off',
  '@stylistic/block-spacing': 'off',
  '@stylistic/brace-style': 'off',
  '@stylistic/comma-dangle': 'off',
  '@stylistic/comma-spacing': 'off',
  '@stylistic/comma-style': 'off',
  '@stylistic/computed-property-spacing': 'off',
  '@stylistic/dot-location': 'off',
  '@stylistic/eol-last': 'off',
  '@stylistic/function-call-argument-newline': 'off',
  '@stylistic/function-call-spacing': 'off',
  '@stylistic/function-paren-newline': 'off',
  '@stylistic/generator-star-spacing': 'off',
  '@stylistic/implicit-arrow-linebreak': 'off',
  '@stylistic/indent': 'off',
  '@stylistic/jsx-quotes': 'off',
  '@stylistic/key-spacing': 'off',
  '@stylistic/keyword-spacing': 'off',
  '@stylistic/linebreak-style': 'off',
  '@stylistic/max-statements-per-line': 'off',
  '@stylistic/multiline-ternary': 'off',
  '@stylistic/new-parens': 'off',
  '@stylistic/newline-per-chained-call': 'off',
  '@stylistic/no-extra-parens': 'off',
  '@stylistic/no-extra-semi': 'off',
  '@stylistic/no-floating-decimal': 'off',
  '@stylistic/no-mixed-spaces-and-tabs': 'off',
  '@stylistic/no-multi-spaces': 'off',
  '@stylistic/no-multiple-empty-lines': 'off',
  '@stylistic/no-trailing-spaces': 'off',
  '@stylistic/no-whitespace-before-property': 'off',
  '@stylistic/nonblock-statement-body-position': 'off',
  '@stylistic/object-curly-newline': 'off',
  '@stylistic/object-curly-spacing': 'off',
  '@stylistic/object-property-newline': 'off',
  '@stylistic/one-var-declaration-per-line': 'off',
  '@stylistic/operator-linebreak': 'off',
  '@stylistic/padded-blocks': 'off',
  '@stylistic/quote-props': 'off',
  '@stylistic/rest-spread-spacing': 'off',
  '@stylistic/semi': 'off',
  '@stylistic/semi-spacing': 'off',
  '@stylistic/semi-style': 'off',
  '@stylistic/space-before-blocks': 'off',
  '@stylistic/space-before-function-paren': 'off',
  '@stylistic/space-in-parens': 'off',
  '@stylistic/space-infix-ops': 'off',
  '@stylistic/space-unary-ops': 'off',
  '@stylistic/switch-colon-spacing': 'off',
  '@stylistic/template-curly-spacing': 'off',
  '@stylistic/template-tag-spacing': 'off',
  '@stylistic/wrap-iife': 'off',
  '@stylistic/wrap-regex': 'off',
  '@stylistic/yield-star-spacing': 'off',
  '@stylistic/member-delimiter-style': 'off',
  '@stylistic/type-annotation-spacing': 'off',
  '@stylistic/jsx-child-element-spacing': 'off',
  '@stylistic/jsx-closing-bracket-location': 'off',
  '@stylistic/jsx-closing-tag-location': 'off',
  '@stylistic/jsx-curly-newline': 'off',
  '@stylistic/jsx-curly-spacing': 'off',
  '@stylistic/jsx-equals-spacing': 'off',
  '@stylistic/jsx-first-prop-new-line': 'off',
  '@stylistic/jsx-indent': 0,
  '@stylistic/jsx-indent-props': 'off',
  '@stylistic/jsx-max-props-per-line': 'off',
  '@stylistic/jsx-newline': 'off',
  '@stylistic/jsx-one-expression-per-line': 'off',
  '@stylistic/jsx-props-no-multi-spaces': 0,
  '@stylistic/jsx-tag-spacing': 'off',
  '@stylistic/jsx-wrap-multilines': 'off',
  '@stylistic/indent-binary-ops': 'off',
  '@stylistic/type-generic-spacing': 'off',
  '@stylistic/type-named-tuple-spacing': 'off',

  // Additional stylistic rules defaulted to off
  '@stylistic/curly-newline': 'off',
  '@stylistic/exp-list-style': 'off',

  // Covered by react/jsx-curly-brace-presence
  '@stylistic/jsx-curly-brace-presence': 'off',
  '@stylistic/jsx-function-call-newline': 'off',
  '@stylistic/jsx-pascal-case': 'off',
  '@stylistic/jsx-self-closing-comp': 'off',
  '@stylistic/line-comment-position': 'off',
  '@stylistic/lines-between-class-members': 'off',
  '@stylistic/multiline-comment-style': 'off',
  '@stylistic/spaced-comment': 'off',
  '@stylistic/exp-jsx-props-style': 'off',

  '@stylistic/padding-line-between-statements': [
    'error',
    {
      blankLine: 'always',
      prev: '*',
      next: '*',
    },
    {
      blankLine: 'never',
      prev: 'import',
      next: 'import',
    },
    {
      blankLine: 'any',
      prev: 'case',
      next: 'case',
    },
    {
      blankLine: 'any',
      prev: 'case',
      next: 'default',
    },
    {
      blankLine: 'any',
      prev: 'default',
      next: 'case',
    },
  ],

  '@stylistic/jsx-sort-props': 0,
} as const satisfies EslintStylisticRules;
