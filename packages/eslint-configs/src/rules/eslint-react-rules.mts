import { type EslintReactRules } from '../types/index.mjs';
import { withDefaultOption } from '../types/rule-severity-branded.mjs';

export const eslintReactRules: EslintReactRules = {
  /**
   * Disable in favor of prettier
   *
   * @link https://github.com/prettier/eslint-config-prettier/blob/main/index.js
   */
  'react/jsx-child-element-spacing': 'off',
  'react/jsx-closing-bracket-location': 'off',
  'react/jsx-closing-tag-location': 'off',
  'react/jsx-curly-newline': 'off',
  'react/jsx-curly-spacing': 'off',
  'react/jsx-equals-spacing': 'off',
  'react/jsx-first-prop-new-line': 'off',
  'react/jsx-indent': 'off',
  'react/jsx-indent-props': 'off',
  'react/jsx-max-props-per-line': 'off',
  'react/jsx-newline': 'off',
  'react/jsx-one-expression-per-line': 'off',
  'react/jsx-props-no-multi-spaces': 'off',
  'react/jsx-tag-spacing': 'off',
  'react/jsx-wrap-multilines': 'off',

  'react/boolean-prop-naming': withDefaultOption('error'),
  'react/button-has-type': withDefaultOption('error'),
  'react/default-props-match-prop-types': withDefaultOption('error'),

  /** Props を展開して使うかどうかを統一する。 */
  'react/destructuring-assignment': withDefaultOption('error'),

  'react/display-name': withDefaultOption('error'),
  'react/forbid-component-props': ['error', { forbid: ['className'] }], // modified
  'react/forbid-dom-props': withDefaultOption('error'),
  'react/forbid-elements': withDefaultOption('error'),
  'react/forbid-foreign-prop-types': withDefaultOption('error'),
  'react/forbid-prop-types': withDefaultOption('error'),
  'react/function-component-definition': [
    'error',
    { unnamedComponents: 'arrow-function', namedComponents: 'arrow-function' },
  ], // modified
  'react/hook-use-state': 'off',
  'react/iframe-missing-sandbox': 'error',
  'react/jsx-boolean-value': ['error', 'always'],
  'react/jsx-curly-brace-presence': ['error', 'always'],

  /** ファイル名の統一 */
  'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }], // modified

  'react/jsx-fragments': withDefaultOption('error'),
  'react/jsx-handler-names': 'off', // disabled
  'react/jsx-key': withDefaultOption('error'),
  'react/jsx-max-depth': 'off', // disabled

  /** JSXに直接コールバック関数を書くのを禁止する。 修正方法： React.useCallback を使うようにする。 */
  'react/jsx-no-bind': withDefaultOption('error'),

  'react/jsx-no-comment-textnodes': 'error',
  'react/jsx-no-constructed-context-values': 'error',
  'react/jsx-no-duplicate-props': withDefaultOption('error'),

  /**
   * JSXに文字列を直接書くのを避け `<div>{"aaa"}</div>` のように書くことを強制する。 変数に `{}`
   * を付け忘れるミスに気づきやすくなったり syntax highlighting で読みやすくなるなどのメリットがある。
   */
  'react/jsx-no-literals': withDefaultOption('error'),

  'react/jsx-no-script-url': withDefaultOption('error'),
  'react/jsx-no-target-blank': withDefaultOption('error'),
  'react/jsx-no-undef': withDefaultOption('error'),
  'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
  'react/jsx-pascal-case': withDefaultOption('error'),

  /** `{...props}` 形式でpropsを渡すと props の過不足のチェックが甘くなるため */
  'react/jsx-props-no-spreading': withDefaultOption('error'), // modified

  'react/jsx-sort-props': [
    'error',
    { callbacksLast: true, reservedFirst: true },
  ], // modified

  'react/jsx-uses-react': 'off', // disabled

  /** ファイル名の統一 */
  'react/jsx-uses-vars': 'error',

  'react/no-access-state-in-setstate': 'error',
  'react/no-adjacent-inline-elements': 'error',
  'react/no-array-index-key': 'error', // modified
  'react/no-arrow-function-lifecycle': 'error',
  'react/no-children-prop': withDefaultOption('error'),
  'react/no-danger-with-children': 'error',
  'react/no-danger': withDefaultOption('error'),
  'react/no-deprecated': 'error',
  'react/no-did-mount-set-state': withDefaultOption('error'),
  'react/no-did-update-set-state': withDefaultOption('error'),
  'react/no-direct-mutation-state': 'error',
  'react/no-find-dom-node': 'error',
  'react/no-invalid-html-attribute': withDefaultOption('error'),
  'react/no-is-mounted': 'error',
  'react/no-multi-comp': [
    'error',
    {
      ignoreStateless: true,
    },
  ],
  'react/no-namespace': 'error',
  'react/no-redundant-should-component-update': 'error',
  'react/no-render-return-value': 'error',
  'react/no-set-state': 'error',
  'react/no-string-refs': withDefaultOption('error'),
  'react/no-this-in-sfc': 'error',
  'react/no-typos': 'error',
  'react/no-unescaped-entities': withDefaultOption('error'),

  // @emotion/react の css prop を使用するため
  'react/no-unknown-property': ['error', { ignore: ['css'] }],

  'react/no-unsafe': withDefaultOption('error'),
  'react/no-object-type-as-default-prop': 'error',
  'react/no-unstable-nested-components': withDefaultOption('error'),
  'react/no-unused-class-component-methods': 'error',
  'react/no-unused-prop-types': withDefaultOption('error'),
  'react/no-unused-state': 'error',
  'react/no-will-update-set-state': withDefaultOption('error'),
  'react/prefer-es6-class': withDefaultOption('error'),
  'react/prefer-exact-props': 'error',
  'react/prefer-read-only-props': 'error',
  'react/prefer-stateless-function': withDefaultOption('error'),

  /** TypeScript では不要 */
  'react/prop-types': 'off',

  'react/react-in-jsx-scope': 'off', // disabled
  'react/require-default-props': withDefaultOption('error'),
  'react/require-optimization': withDefaultOption('error'),
  'react/require-render-return': 'error',
  'react/self-closing-comp': withDefaultOption('error'),
  'react/sort-comp': withDefaultOption('error'),
  'react/sort-default-props': withDefaultOption('error'),
  'react/sort-prop-types': withDefaultOption('error'),
  'react/state-in-constructor': withDefaultOption('error'),
  'react/static-property-placement': withDefaultOption('error'),
  'react/style-prop-object': withDefaultOption('error'),
  'react/void-dom-elements-no-children': 'error',
  'react/jsx-no-leaked-render': [
    'error',
    {
      validStrategies: ['ternary'],
    },
  ],
  'react/checked-requires-onchange-or-readonly': withDefaultOption('error'),
  'react/jsx-props-no-spread-multi': 'error',
  'react/forward-ref-uses-ref': 'error',

  // deprecated
  'react/jsx-sort-default-props': 0,
  'react/jsx-space-before-closing': 0,
} as const;
