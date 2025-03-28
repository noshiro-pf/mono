import { type EslintRules, type EslintRulesOption } from '../types/index.mjs';
import { withDefaultOption } from '../types/rule-severity-branded.mjs';

export const restrictedSyntax = [
  {
    // ban "in" operator
    selector: "BinaryExpression[operator='in']",
    message: 'use "Object.hasOwn" instead.',
  },
  {
    // ban Object.prototype.hasOwnProperty.call
    selector:
      "MemberExpression[object.object.object.name='Object'][object.object.property.name='prototype'][object.property.name='hasOwnProperty'][property.name='call']",
    message: 'use "Object.hasOwn" instead.',
  },
  {
    // ban "new Array" expression
    selector: "NewExpression[callee.name='Array']",
    message: "use Array.from or 'Arr.zeros' from '@noshiro/ts-utils' instead.",
  },
  {
    // ban "React.useImperativeHandle"
    selector:
      "MemberExpression[object.name='React'][property.name='useImperativeHandle']",
    message: 'pass Observable via props instead.',
  },

  // replaced by @typescript-eslint/consistent-type-assertions and total-functions/no-unsafe-type-assertion
  // {
  //   // ban "as"
  //   selector: "TSAsExpression[typeAnnotation.typeName.name!='const']",
  //   message: "Don't use `as`.",
  // },
  // {
  //   selector:
  //     "Identifier[name='draft'][parent.parent.callee.name!='produce'][parent.parent.parent.parent.parent.parent.callee.name!='produce']",
  //   message:
  //     "Don't use the identifier name `draft` except in immer produce function.",
  // },
  {
    selector:
      ":not(Property) > Identifier[name='String'][parent.type!='MemberExpression']",
    message: "use Str.from from '@noshiro/ts-utils' instead.",
  },
];

export const restrictedGlobals = [
  'eval',
  'Function',
  {
    name: 'Infinity',
    message: "use 'Number.Infinity' instead.",
  },
  {
    name: 'isFinite',
    message: "use 'Number.isFinite' instead.",
  },
  {
    name: 'isNaN',
    message: "use 'Number.isNaN' instead.",
  },
  {
    name: 'NaN',
    message: "use 'Number.NaN'  instead.",
  },
  {
    name: 'parseFloat',
    message: "use 'Number.parseFloat' instead.",
  },
  {
    name: 'parseInt',
    message: "use 'Number.parseInt' instead.",
  },
  {
    name: 'Map',
    message: "use 'IMap' or 'MutableMap' in '@noshiro/ts-utils' instead.",
  },
  {
    name: 'Set',
    message: "use 'ISet' or 'MutableSet' from '@noshiro/ts-utils' instead.",
  },
  {
    name: 'Boolean',
    message: "use toBoolean from '@noshiro/ts-utils' instead.",
  },
  {
    name: 'JSON',
    message: "use Json from '@noshiro/ts-utils' instead.",
  },
] as const satisfies EslintRulesOption['no-restricted-globals'];

export const restrictedGlobalsForFrontend = [
  ...restrictedGlobals,
  {
    // react-router の location との曖昧性回避のため
    name: 'location',
    message: "use 'window.location' instead.",
  },
  {
    // react-router の history との曖昧性回避のため
    name: 'history',
    message: "use 'window.history' instead.",
  },
  {
    // react-router の navigator との曖昧性回避のため
    name: 'navigator',
    message: "use 'window.navigator' instead.",
  },
] as const satisfies EslintRulesOption['no-restricted-globals'];

/** @link https://github.com/eslint/eslint/blob/main/conf/eslint-all.js */
export const eslintRules: EslintRules = {
  /**
   * Disable in favor of prettier
   *
   * @link https://github.com/eslint/eslint/blob/main/conf/eslint-all.js
   * @link https://github.com/eslint/eslint/blob/main/conf/eslint-recommended.js
   */

  // The following rules can be used in some cases. See the README for more
  // information. (These are marked with `0` instead of `"off"` so that a
  // script can distinguish them.)
  curly: 'off',
  'no-unexpected-multiline': 'off',

  // The rest are rules that you never need to enable when using Prettier.
  // 'new-parens': 'off',
  'unicode-bom': 'off',

  /**
   * Disable in favor of @typescript-eslint
   *
   * @link https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslint-recommended.ts
   */

  'constructor-super': 'off', // ts(2335) & ts(2377)
  'getter-return': 'off', // ts(2378)
  'no-const-assign': 'off', // ts(2588)
  'no-dupe-args': 'off', // ts(2300)
  'no-dupe-class-members': 'off', // ts(2393) & ts(2300)
  'no-dupe-keys': 'off', // ts(1117)
  'no-func-assign': 'off', // ts(2539)
  'no-import-assign': 'off', // ts(2539) & ts(2540)
  'no-obj-calls': 'off', // ts(2349)
  'no-redeclare': 'off', // ts(2451)
  'no-setter-return': 'off', // ts(2408)
  'no-this-before-super': 'off', // ts(2376)
  'no-undef': 'off', // ts(2304)
  'no-unreachable': 'off', // ts(7027)
  'no-unsafe-negation': 'off', // ts(2365) & ts(2360) & ts(2358)
  'no-var': 'error', // ts transpiles let/const to var, so no need for vars any more
  'prefer-const': withDefaultOption('error'), // ts provides better types with const
  'prefer-rest-params': 'error', // ts provides better types with rest args over arguments
  'prefer-spread': 'error', // ts transpiles spread to apply, so no need for manual apply
  'valid-typeof': 'off', // ts(2367)

  // disable instead of enabling @typescript-eslint's equivalent or upward compatible rules
  'default-param-last': 'off',
  'dot-notation': 'off',
  'init-declarations': 'off',
  'no-array-constructor': 'off',
  'no-duplicate-imports': 'off',
  'no-empty-function': 'off',
  'no-implied-eval': 'off',
  'no-invalid-this': 'off',
  'no-loop-func': 'off',
  'no-loss-of-precision': 'off',
  'no-magic-numbers': 'off',
  'no-restricted-imports': 'off',
  'no-shadow': 'off',
  'no-throw-literal': 'off',
  'no-unused-expressions': 'off',
  'no-unused-vars': 'off',
  'no-use-before-define': 'off',
  'no-useless-constructor': 'off',
  'require-await': 'off',
  'class-methods-use-this': 'off',
  'prefer-promise-reject-errors': 'off',
  'consistent-return': 'off',

  // customized
  'accessor-pairs': withDefaultOption('error'),

  // When there is no default case for a switch statement, there is a false positive that reports an error without considering type information.
  'array-callback-return': 'off',

  'arrow-body-style': ['error', 'as-needed'],
  'block-scoped-var': 'error',
  camelcase: 'off', // disabled
  'capitalized-comments': 'off', // disabled
  complexity: 'off', // disabled
  'consistent-this': withDefaultOption('error'),
  'default-case-last': 'error',
  'default-case': 'off', // disabled
  eqeqeq: ['error', 'always', { null: 'ignore' }], // modified
  'for-direction': 'error',
  'func-name-matching': withDefaultOption('error'),
  'func-names': withDefaultOption('error'),
  'func-style': 'off', // 関数オーバーロードで偽陽性が出る
  'grouped-accessor-pairs': withDefaultOption('error'),
  'guard-for-in': 'error',
  'id-denylist': withDefaultOption('error'),
  'id-length': 'off', // disabled
  'id-match': withDefaultOption('error'),
  'logical-assignment-operators': [
    'error',
    'always',
    { enforceForIfStatements: true },
  ],
  'max-classes-per-file': 'off', // disabled
  'max-depth': 'off', // disabled
  'max-lines-per-function': 'off', // disabled
  'max-lines': 'off', // disabled
  'max-nested-callbacks': withDefaultOption('error'),
  'max-params': 'off', // disabled
  'max-statements': 'off', // disabled
  'new-cap': 'off', // disabled
  'no-alert': 'error',
  'no-async-promise-executor': 'error',
  'no-await-in-loop': 'error',
  'no-bitwise': 'off', // disabled
  'no-caller': 'error',
  'no-case-declarations': 'error',
  'no-class-assign': 'error',
  'no-compare-neg-zero': 'error',
  'no-cond-assign': withDefaultOption('error'),
  'no-console': 'off', // disabled
  'no-constant-binary-expression': 'error',
  'no-constant-condition': withDefaultOption('error'),
  'no-constructor-return': 'error',
  'no-continue': 'off', // disabled
  'no-control-regex': 'error',
  'no-debugger': 'error',
  'no-delete-var': 'error',
  'no-div-regex': 'error',
  'no-dupe-else-if': 'error',
  'no-duplicate-case': 'error',
  'no-else-return': 'off', // disabled
  'no-empty-character-class': 'error',
  'no-empty-pattern': withDefaultOption('error'),
  'no-empty-static-block': 'error',
  'no-empty': withDefaultOption('error'),
  'no-eq-null': 'off', // eqeqeqでnull許容するならoff
  'no-eval': withDefaultOption('error'),
  'no-ex-assign': 'error',
  'no-extend-native': withDefaultOption('error'),
  'no-extra-bind': 'error',
  'no-extra-boolean-cast': [
    'error',
    {
      enforceForLogicalOperands: true,
    },
  ],
  'no-extra-label': 'error',
  'no-fallthrough': withDefaultOption('error'),
  'no-global-assign': withDefaultOption('error'),
  'no-implicit-coercion': [
    'error',
    {
      allow: [],
      boolean: false,
      disallowTemplateShorthand: true,
      number: true,
      string: true,
    },
  ],
  'no-implicit-globals': withDefaultOption('error'),
  'no-inline-comments': 'off', // disabled
  'no-inner-declarations': withDefaultOption('error'),
  'no-invalid-regexp': withDefaultOption('error'),
  'no-irregular-whitespace': withDefaultOption('error'),
  'no-iterator': 'error',
  'no-label-var': 'error',
  'no-labels': withDefaultOption('error'),
  'no-lone-blocks': 'off', // disabled
  'no-lonely-if': 'off', // disabled
  'no-misleading-character-class': withDefaultOption('error'),
  'no-multi-assign': withDefaultOption('error'),
  'no-multi-str': 'error',
  'no-negated-condition': 'off', // disabled
  'no-nested-ternary': 'off', // unicorn/no-nested-ternary
  'no-new-func': 'error',
  'no-new-native-nonconstructor': 'error',
  'no-new-wrappers': 'error',
  'no-new': 'error',
  'no-nonoctal-decimal-escape': 'error',
  'no-object-constructor': 'error',
  'no-octal-escape': 'error',
  'no-octal': 'error',
  'no-param-reassign': withDefaultOption('error'),

  /** `++x` や `x++` という式の値を使用しているコードは可読性が落ちやすいため警告を出す */
  'no-plusplus': [
    'error',
    {
      allowForLoopAfterthoughts: true,
    },
  ],

  'no-promise-executor-return': withDefaultOption('error'),
  'no-proto': 'error',
  'no-prototype-builtins': 'error',
  'no-regex-spaces': 'error',
  'no-restricted-exports': withDefaultOption('error'),
  'no-restricted-globals': ['error', ...restrictedGlobals],
  'no-restricted-properties': withDefaultOption('error'),

  /**
   * 他ルールで実現しづらい禁止したい構文をここに書く。 以下のAST checker を用いて selector をどう書くべきか調べることができる。
   *
   * AST checker:
   * https://typescript-eslint.io/play/#ts=4.7.2&sourceType=module&showAST=es
   */
  'no-restricted-syntax': ['error', ...restrictedSyntax],

  'no-return-assign': withDefaultOption('error'),
  'no-script-url': 'error',
  'no-self-assign': withDefaultOption('error'),
  'no-self-compare': 'error',
  'no-sequences': withDefaultOption('error'),
  'no-shadow-restricted-names': 'error',
  'no-sparse-arrays': 'error',
  'no-template-curly-in-string': 'error',
  'no-ternary': 'off', // disabled
  'no-undef-init': 'off', // disabled
  'no-undefined': 'off', // disabled
  'no-underscore-dangle': 'off', // disabled
  'no-unmodified-loop-condition': 'error',
  'no-unneeded-ternary': withDefaultOption('error'),
  'no-unreachable-loop': withDefaultOption('error'),
  'no-unsafe-finally': 'error',
  'no-unsafe-optional-chaining': withDefaultOption('error'),
  'no-unused-labels': 'error',
  'no-unused-private-class-members': 'error',
  'no-useless-backreference': 'error',
  'no-useless-call': 'error',
  'no-useless-catch': 'error',
  'no-useless-computed-key': withDefaultOption('error'),
  'no-useless-concat': 'error',
  'no-useless-escape': 'error',
  'no-useless-rename': withDefaultOption('error'),
  'no-useless-return': 'error',
  'no-void': withDefaultOption('error'),
  'no-warning-comments': 'off', // disabled
  'no-with': 'error',
  'object-shorthand': withDefaultOption('error'),
  'one-var': 'off', // disabled
  'operator-assignment': withDefaultOption('error'),
  'prefer-arrow-callback': withDefaultOption('error'),
  'prefer-destructuring': 'off', // disabled
  'prefer-exponentiation-operator': 'error',
  'prefer-named-capture-group': 'off', // disabled
  'prefer-numeric-literals': 'error',
  'prefer-object-has-own': 'error',
  'prefer-object-spread': 'error',
  'prefer-regex-literals': withDefaultOption('error'),

  /**
   * `+` の曖昧性回避のため使用。 restrict-plus-operands で bigint, number, string
   * 同士にしか使用できないように制限し、 prefer-template で文字列の連結に `+` を使うことも禁止する。 修正方法： template
   * literal を使うか、文字列の配列を `join("")` で結合する。
   *
   *     - a + b -> `${a}${b}`
   *     - s_1 + s_2 + ... + s_n -> [s_1, ..., s_n].join("")
   */
  'prefer-template': 'error',

  radix: withDefaultOption('error'),
  'require-atomic-updates': withDefaultOption('error'),
  'require-unicode-regexp': withDefaultOption('error'),
  'require-yield': 'error',
  'sort-imports': 'off', // disabled
  'sort-keys': 'off', // disabled
  'sort-vars': 'off', // disabled
  strict: withDefaultOption('error'),
  'symbol-description': 'off', // disabled
  'use-isnan': withDefaultOption('error'),
  'vars-on-top': 'error',
  yoda: 'off', // disabled

  'no-useless-assignment': 'error',

  // deprecated
  'lines-around-comment': 0,
  'max-len': 0,
  'no-confusing-arrow': 0,
  'no-mixed-operators': 0,
  'no-tabs': 0,
  quotes: 0,
  'array-bracket-newline': 0,
  'array-bracket-spacing': 0,
  'array-element-newline': 0,
  'arrow-parens': 0,
  'arrow-spacing': 0,
  'block-spacing': 0,
  'brace-style': 0,
  'comma-dangle': 0,
  'comma-spacing': 0,
  'comma-style': 0,
  'computed-property-spacing': 0,
  'dot-location': 0,
  'eol-last': 0,
  'func-call-spacing': 0,
  'function-call-argument-newline': 0,
  'function-paren-newline': 0,
  'generator-star-spacing': 0,
  'implicit-arrow-linebreak': 0,
  indent: 0,
  'jsx-quotes': 0,
  'key-spacing': 0,
  'keyword-spacing': 0,
  'linebreak-style': 0,
  'multiline-ternary': 0,
  'newline-per-chained-call': 0,
  'no-extra-parens': 0,
  'no-extra-semi': 0,
  'no-floating-decimal': 0,
  'no-mixed-spaces-and-tabs': 0,
  'no-multi-spaces': 0,
  'no-multiple-empty-lines': 0,
  'no-trailing-spaces': 0,
  'no-whitespace-before-property': 0,
  'nonblock-statement-body-position': 0,
  'object-curly-newline': 0,
  'object-curly-spacing': 0,
  'object-property-newline': 0,
  'one-var-declaration-per-line': 0,
  'operator-linebreak': 0,
  'padded-blocks': 0,
  'quote-props': 0,
  'rest-spread-spacing': 0,
  semi: 0,
  'semi-spacing': 0,
  'semi-style': 0,
  'space-before-blocks': 0,
  'space-before-function-paren': 0,
  'space-in-parens': 0,
  'space-infix-ops': 0,
  'space-unary-ops': 0,
  'switch-colon-spacing': 0,
  'template-curly-spacing': 0,
  'template-tag-spacing': 0,
  'wrap-iife': 0,
  'wrap-regex': 0,
  'yield-star-spacing': 0,
  'new-parens': 0,
  'lines-between-class-members': 0,
  'padding-line-between-statements': 0,
  'no-return-await': 0,
  'max-statements-per-line': 0,
  'no-new-object': 0,
  'spaced-comment': 0,
  'callback-return': 0,
  'global-require': 0,
  'handle-callback-err': 0,
  'id-blacklist': 0,
  'indent-legacy': 0,
  'lines-around-directive': 0,
  'newline-after-var': 0,
  'newline-before-return': 0,
  'no-buffer-constructor': 0,
  'no-catch-shadow': 0,
  'no-mixed-requires': 0,
  'no-native-reassign': 0,
  'no-negated-in-lhs': 0,
  'no-new-require': 0,
  'no-path-concat': 0,
  'no-process-env': 0,
  'no-process-exit': 0,
  'no-restricted-modules': 0,
  'no-spaced-func': 0,
  'no-sync': 0,
  'prefer-reflect': 0,
  'no-new-symbol': 0, // ts(2588)
  'line-comment-position': 0, // disabled
  'multiline-comment-style': 0, // disabled
} as const;
