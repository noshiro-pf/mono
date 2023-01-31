'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-react-rules").EslintReactRules } EslintReactRules */

/** @type {EslintReactRules} */
const eslintReactRules = {
  /**
   * disable in favor of prettier
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

  'react/boolean-prop-naming': 'error',
  'react/button-has-type': 'error',
  'react/default-props-match-prop-types': 'error',

  /**
   * props を展開して使うかどうかを統一する。
   */
  'react/destructuring-assignment': 'error',

  'react/display-name': 'error',
  'react/forbid-component-props': ['error', { forbid: ['className'] }], // modified
  'react/forbid-dom-props': 'error',
  'react/forbid-elements': 'error',
  'react/forbid-foreign-prop-types': 'error',
  'react/forbid-prop-types': 'error',
  'react/function-component-definition': [
    'error',
    { unnamedComponents: 'arrow-function', namedComponents: 'arrow-function' },
  ], // modified
  'react/hook-use-state': 'off', // disabled
  'react/iframe-missing-sandbox': 'error',
  'react/jsx-boolean-value': 'off', // disabled
  'react/jsx-curly-brace-presence': 'off', // disabled
  'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }], // modified
  'react/jsx-fragments': 'error',
  'react/jsx-handler-names': 'off', // disabled
  'react/jsx-key': 'error',
  'react/jsx-max-depth': 'off', // disabled

  /**
   * JSXに直接コールバック関数を書くのを禁止する。
   * 修正方法： React.useCallback を使うようにする。
   */
  'react/jsx-no-bind': 'error',

  'react/jsx-no-comment-textnodes': 'error',
  'react/jsx-no-constructed-context-values': 'error',
  'react/jsx-no-duplicate-props': 'error',

  /**
   * JSXに文字列を直接書くのを避け `<div>{"aaa"}</div>` のように書くことを強制する。
   * 変数に `{}` を付け忘れるミスに気づきやすくなったり syntax highlighting で読みやすくなるなどのメリットがある。
   */
  'react/jsx-no-literals': 'error',

  'react/jsx-no-script-url': 'error',
  'react/jsx-no-target-blank': 'error',
  'react/jsx-no-undef': 'error',
  'react/jsx-no-useless-fragment': 'error',
  'react/jsx-pascal-case': 'error',

  /**
   * `{...props}` 形式でpropsを渡すと props の過不足のチェックが甘くなるため
   */
  'react/jsx-props-no-spreading': 'error', // modified

  'react/jsx-sort-props': [
    'error',
    { callbacksLast: true, reservedFirst: true },
  ], // modified
  'react/jsx-uses-react': 'off', // disabled
  'react/jsx-uses-vars': 'error',
  'react/no-access-state-in-setstate': 'error',
  'react/no-adjacent-inline-elements': 'error',
  'react/no-array-index-key': 'error', // modified
  'react/no-arrow-function-lifecycle': 'error',
  'react/no-children-prop': 'error',
  'react/no-danger-with-children': 'error',
  'react/no-danger': 'error',
  'react/no-deprecated': 'error',
  'react/no-did-mount-set-state': 'error',
  'react/no-did-update-set-state': 'error',
  'react/no-direct-mutation-state': 'error',
  'react/no-find-dom-node': 'error',
  'react/no-invalid-html-attribute': 'error',
  'react/no-is-mounted': 'error',
  'react/no-multi-comp': 'error',
  'react/no-namespace': 'error',
  'react/no-redundant-should-component-update': 'error',
  'react/no-render-return-value': 'error',
  'react/no-set-state': 'error',
  'react/no-string-refs': 'error',
  'react/no-this-in-sfc': 'error',
  'react/no-typos': 'error',
  'react/no-unescaped-entities': 'error',
  'react/no-unknown-property': ['error', { ignore: ['css'] }],
  'react/no-unsafe': 'error',
  'react/no-object-type-as-default-prop': 'error',
  'react/no-unstable-nested-components': 'error',
  'react/no-unused-class-component-methods': 'error',
  'react/no-unused-prop-types': 'error',
  'react/no-unused-state': 'error',
  'react/no-will-update-set-state': 'error',
  'react/prefer-es6-class': 'error',
  'react/prefer-exact-props': 'error',
  'react/prefer-read-only-props': 'error',
  'react/prefer-stateless-function': 'error',

  /**
   * TypeScript では不要
   */
  'react/prop-types': 'off',

  'react/react-in-jsx-scope': 'off', // disabled
  'react/require-default-props': 'error',
  'react/require-optimization': 'error',
  'react/require-render-return': 'error',
  'react/self-closing-comp': 'error',
  'react/sort-comp': 'error',
  'react/sort-default-props': 'error',
  'react/sort-prop-types': 'error',
  'react/state-in-constructor': 'error',
  'react/static-property-placement': 'error',
  'react/style-prop-object': 'error',
  'react/void-dom-elements-no-children': 'error',
  'react/jsx-no-leaked-render': 'error',

  // deprecated
  'react/jsx-sort-default-props': 'off',
  'react/jsx-space-before-closing': 'off',
};

module.exports = { eslintReactRules };
