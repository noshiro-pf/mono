import { type EslintRules } from '../types/rules/eslint-rules.mjs';

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
    message: "use Array.from or 'Arr.zeros' from @utils/Array instead.",
  },
  {
    // ban "React.useImperativeHandle"
    selector:
      "MemberExpression[object.name='React'][property.name='useImperativeHandle']",
    message: 'pass Observable via props instead.',
  },
  {
    // ban "as"
    selector: "TSAsExpression[typeAnnotation.typeName.name!='const']",
    message: "Don't use `as`.",
  },
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

/**
 * @link https://github.com/eslint/eslint/blob/main/conf/eslint-all.js
 */
export const eslintRules: EslintRules = {
  /**
   * disable in favor of prettier
   * @link https://github.com/eslint/eslint/blob/main/conf/eslint-all.js
   * @link https://github.com/eslint/eslint/blob/main/conf/eslint-recommended.js
   */

  // The following rules can be used in some cases. See the README for more
  // information. (These are marked with `0` instead of `"off"` so that a
  // script can distinguish them.)
  curly: 'off',
  'lines-around-comment': 'off',
  'max-len': 'off',
  'no-confusing-arrow': 'off',
  'no-mixed-operators': 'off',
  'no-tabs': 'off',
  'no-unexpected-multiline': 'off',
  quotes: 'off',

  // The rest are rules that you never need to enable when using Prettier.
  'array-bracket-newline': 'off',
  'array-bracket-spacing': 'off',
  'array-element-newline': 'off',
  'arrow-parens': 'off',
  'arrow-spacing': 'off',
  'block-spacing': 'off',
  'brace-style': 'off',
  'comma-dangle': 'off',
  'comma-spacing': 'off',
  'comma-style': 'off',
  'computed-property-spacing': 'off',
  'dot-location': 'off',
  'eol-last': 'off',
  'func-call-spacing': 'off',
  'function-call-argument-newline': 'off',
  'function-paren-newline': 'off',
  'generator-star-spacing': 'off',
  'implicit-arrow-linebreak': 'off',
  indent: 'off',
  'jsx-quotes': 'off',
  'key-spacing': 'off',
  'keyword-spacing': 'off',
  'linebreak-style': 'off',
  'multiline-ternary': 'off',
  'newline-per-chained-call': 'off',
  // 'new-parens': 'off',
  'no-extra-parens': 'off',
  'no-extra-semi': 'off',
  'no-floating-decimal': 'off',
  'no-mixed-spaces-and-tabs': 'off',
  'no-multi-spaces': 'off',
  'no-multiple-empty-lines': 'off',
  'no-trailing-spaces': 'off',
  'no-whitespace-before-property': 'off',
  'nonblock-statement-body-position': 'off',
  'object-curly-newline': 'off',
  'object-curly-spacing': 'off',
  'object-property-newline': 'off',
  'one-var-declaration-per-line': 'off',
  'operator-linebreak': 'off',
  'padded-blocks': 'off',
  'quote-props': 'off',
  'rest-spread-spacing': 'off',
  semi: 'off',
  'semi-spacing': 'off',
  'semi-style': 'off',
  'space-before-blocks': 'off',
  'space-before-function-paren': 'off',
  'space-in-parens': 'off',
  'space-infix-ops': 'off',
  'space-unary-ops': 'off',
  'switch-colon-spacing': 'off',
  'template-curly-spacing': 'off',
  'template-tag-spacing': 'off',
  'unicode-bom': 'off',
  'wrap-iife': 'off',
  'wrap-regex': 'off',
  'yield-star-spacing': 'off',

  'new-parens': 'off',

  /**
   * disable in favor of @typescript-eslint
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
  'no-new-symbol': 'off', // ts(2588)
  'no-obj-calls': 'off', // ts(2349)
  'no-redeclare': 'off', // ts(2451)
  'no-setter-return': 'off', // ts(2408)
  'no-this-before-super': 'off', // ts(2376)
  'no-undef': 'off', // ts(2304)
  'no-unreachable': 'off', // ts(7027)
  'no-unsafe-negation': 'off', // ts(2365) & ts(2360) & ts(2358)
  'no-var': 'error', // ts transpiles let/const to var, so no need for vars any more
  'prefer-const': 'error', // ts provides better types with const
  'prefer-rest-params': 'error', // ts provides better types with rest args over arguments
  'prefer-spread': 'error', // ts transpiles spread to apply, so no need for manual apply
  'valid-typeof': 'off', // ts(2367)

  // disable instead of enabling @typescript-eslint's equivalent or upward compatible rules
  'default-param-last': 'off',
  'dot-notation': 'off',
  'init-declarations': 'off',
  'lines-between-class-members': 'off',
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
  'padding-line-between-statements': 'off',
  'require-await': 'off',
  'no-return-await': 'off',
  'class-methods-use-this': 'off',

  // customized
  'accessor-pairs': 'error',
  'array-callback-return': 'error',
  'arrow-body-style': ['error', 'as-needed'],
  'block-scoped-var': 'error',
  camelcase: 'off', // disabled
  'capitalized-comments': 'off', // disabled
  complexity: 'off', // disabled
  'consistent-return': 'off', // disabled
  'consistent-this': 'error',
  'default-case-last': 'error',
  'default-case': 'off', // disabled
  eqeqeq: ['error', 'always', { null: 'ignore' }], // modified
  'for-direction': 'error',
  'func-name-matching': 'error',
  'func-names': 'error',
  'func-style': 'off', // 関数オーバーロードで偽陽性が出る
  'grouped-accessor-pairs': 'error',
  'guard-for-in': 'error',
  'id-denylist': 'error',
  'id-length': 'off', // disabled
  'id-match': 'error',
  'line-comment-position': 'off', // disabled
  'logical-assignment-operators': [
    'error',
    'always',
    { enforceForIfStatements: true },
  ],
  'max-classes-per-file': 'off', // disabled
  'max-depth': 'off', // disabled
  'max-lines-per-function': 'off', // disabled
  'max-lines': 'off', // disabled
  'max-nested-callbacks': 'error',
  'max-params': 'off', // disabled
  'max-statements-per-line': 'off',
  'max-statements': 'off', // disabled
  'multiline-comment-style': 'off', // disabled
  'new-cap': 'off', // disabled
  'no-alert': 'error',
  'no-async-promise-executor': 'error',
  'no-await-in-loop': 'error',
  'no-bitwise': 'off', // disabled
  'no-caller': 'error',
  'no-case-declarations': 'error',
  'no-class-assign': 'error',
  'no-compare-neg-zero': 'error',
  'no-cond-assign': 'error',
  'no-console': 'off', // disabled
  'no-constant-binary-expression': 'error',
  'no-constant-condition': 'error',
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
  'no-empty-pattern': 'error',
  'no-empty-static-block': 'error',
  'no-empty': 'error',
  'no-eq-null': 'off', // eqeqeqでnull許容するならoff
  'no-eval': 'error',
  'no-ex-assign': 'error',
  'no-extend-native': 'error',
  'no-extra-bind': 'error',
  'no-extra-boolean-cast': 'error',
  'no-extra-label': 'error',
  'no-fallthrough': 'error',
  'no-global-assign': 'error',
  'no-implicit-coercion': 'error',
  'no-implicit-globals': 'error',
  'no-inline-comments': 'off', // disabled
  'no-inner-declarations': 'error',
  'no-invalid-regexp': 'error',
  'no-irregular-whitespace': 'error',
  'no-iterator': 'error',
  'no-label-var': 'error',
  'no-labels': 'error',
  'no-lone-blocks': 'off', // disabled
  'no-lonely-if': 'off', // disabled
  'no-misleading-character-class': 'error',
  'no-multi-assign': 'error',
  'no-multi-str': 'error',
  'no-negated-condition': 'off', // disabled
  'no-nested-ternary': 'off', // unicorn/no-nested-ternary
  'no-new-func': 'error',
  'no-new-native-nonconstructor': 'error',
  'no-new-object': 'off',
  'no-new-wrappers': 'error',
  'no-new': 'error',
  'no-nonoctal-decimal-escape': 'error',
  'no-object-constructor': 'error',
  'no-octal-escape': 'error',
  'no-octal': 'error',
  'no-param-reassign': 'error',
  'no-plusplus': 'error',
  'no-promise-executor-return': 'error',
  'no-proto': 'error',
  'no-prototype-builtins': 'error',
  'no-regex-spaces': 'error',
  'no-restricted-exports': 'error',
  'no-restricted-globals': [
    'error',
    'eval',
    'Function',
    'globalThis',
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
  ],
  'no-restricted-properties': 'error',

  /**
   * 他ルールで実現しづらい禁止したい構文をここに書く。
   * 以下のAST checker を用いて selector をどう書くべきか調べることができる。
   *
   * AST checker: https://typescript-eslint.io/play/#ts=4.7.2&sourceType=module&showAST=es
   */
  'no-restricted-syntax': ['error', ...restrictedSyntax],
  'no-return-assign': 'error',
  'no-script-url': 'error',
  'no-self-assign': 'error',
  'no-self-compare': 'error',
  'no-sequences': 'error',
  'no-shadow-restricted-names': 'error',
  'no-sparse-arrays': 'error',
  'no-template-curly-in-string': 'error',
  'no-ternary': 'off', // disabled
  'no-undef-init': 'off', // disabled
  'no-undefined': 'off', // disabled
  'no-underscore-dangle': 'off', // disabled
  'no-unmodified-loop-condition': 'error',
  'no-unneeded-ternary': 'error',
  'no-unreachable-loop': 'error',
  'no-unsafe-finally': 'error',
  'no-unsafe-optional-chaining': 'error',
  'no-unused-labels': 'error',
  'no-unused-private-class-members': 'error',
  'no-useless-backreference': 'error',
  'no-useless-call': 'error',
  'no-useless-catch': 'error',
  'no-useless-computed-key': 'error',
  'no-useless-concat': 'error',
  'no-useless-escape': 'error',
  'no-useless-rename': 'error',
  'no-useless-return': 'error',
  'no-void': 'error',
  'no-warning-comments': 'off', // disabled
  'no-with': 'error',
  'object-shorthand': 'error',
  'one-var': 'off', // disabled
  'operator-assignment': 'error',
  'prefer-arrow-callback': 'error',
  'prefer-destructuring': 'off', // disabled
  'prefer-exponentiation-operator': 'error',
  'prefer-named-capture-group': 'error',
  'prefer-numeric-literals': 'error',
  'prefer-object-has-own': 'error',
  'prefer-object-spread': 'error',
  'prefer-promise-reject-errors': 'error',
  'prefer-regex-literals': 'error',

  /**
   * `+` の曖昧性回避のため使用。
   * restrict-plus-operands で bigint, number, string 同士にしか使用できないように制限し、
   * prefer-template で文字列の連結に `+` を使うことも禁止する。
   * 修正方法： template literal を使うか、文字列の配列を `join("")` で結合する。
   *  - a + b -> `${a}${b}`
   *  - s_1 + s_2 + ... + s_n -> [s_1, ..., s_n].join("")
   */
  'prefer-template': 'error',
  radix: 'error',
  'require-atomic-updates': 'error',
  'require-unicode-regexp': 'error',
  'require-yield': 'error',
  'sort-imports': 'off', // disabled
  'sort-keys': 'off', // disabled
  'sort-vars': 'off', // disabled
  'spaced-comment': 'off', // disabled
  strict: 'error',
  'symbol-description': 'off', // disabled
  'use-isnan': 'error',
  'vars-on-top': 'error',
  yoda: 'off', // disabled

  // deprecated
  'callback-return': 'off',
  'global-require': 'off',
  'handle-callback-err': 'off',
  'id-blacklist': 'off',
  'indent-legacy': 'off',
  'lines-around-directive': 'off',
  'newline-after-var': 'off',
  'newline-before-return': 'off',
  'no-buffer-constructor': 'off',
  'no-catch-shadow': 'off',
  'no-mixed-requires': 'off',
  'no-native-reassign': 'off',
  'no-negated-in-lhs': 'off',
  'no-new-require': 'off',
  'no-path-concat': 'off',
  'no-process-env': 'off',
  'no-process-exit': 'off',
  'no-restricted-modules': 'off',
  'no-spaced-func': 'off',
  'no-sync': 'off',
  'prefer-reflect': 'off',
  'require-jsdoc': 'off',
  'valid-jsdoc': 'off',
};