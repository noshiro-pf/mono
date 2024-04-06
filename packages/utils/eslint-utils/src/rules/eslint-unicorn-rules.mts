import { type EslintUnicornRules } from '../types/rules/eslint-unicorn-rules.mjs';

export const eslintUnicornRules: EslintUnicornRules = {
  /**
   * Disable in favor of prettier
   *
   * @link https://github.com/prettier/eslint-config-prettier/blob/main/index.js
   */
  'unicorn/empty-brace-spaces': 'off',
  'unicorn/no-nested-ternary': 'off',
  'unicorn/number-literal-case': 'off',

  'unicorn/better-regex': 'error',
  'unicorn/catch-error-name': 'error',

  'unicorn/consistent-destructuring': 'error',

  'unicorn/consistent-function-scoping': 'error',
  'unicorn/custom-error-definition': 'off',
  'unicorn/error-message': 'error',
  'unicorn/escape-case': 'error',
  'unicorn/expiring-todo-comments': 'error',
  'unicorn/explicit-length-check': 'off',
  'unicorn/filename-case': [
    'error',
    {
      case: 'kebabCase',
      ignore: ['serviceWorker.ts', 'setupTests.ts'],
    },
  ],
  'unicorn/import-style': 'error',
  'unicorn/new-for-builtins': 'error',
  'unicorn/no-abusive-eslint-disable': 'error',
  'unicorn/no-array-callback-reference': 'off',
  'unicorn/no-array-for-each': 'error',
  'unicorn/no-array-method-this-argument': 'off', // not compatible with my Arr.map utility
  'unicorn/no-array-push-push': 'error',
  'unicorn/no-array-reduce': 'off',
  'unicorn/no-await-expression-member': 'error',
  'unicorn/no-console-spaces': 'off', // turned off to enable aligning output
  'unicorn/no-document-cookie': 'error',
  'unicorn/no-empty-file': 'error',
  'unicorn/no-for-loop': 'error',
  'unicorn/no-hex-escape': 'error',
  'unicorn/no-instanceof-array': 'error',
  'unicorn/no-invalid-remove-event-listener': 'error',
  'unicorn/no-keyword-prefix': 'off', // {"onlyCamelCase": false}
  'unicorn/no-lonely-if': 'error',
  'unicorn/no-negated-condition': 'off',
  'unicorn/no-new-array': 'error',
  'unicorn/no-new-buffer': 'error',
  'unicorn/no-null': 'off',
  'unicorn/no-object-as-default-parameter': 'error',
  'unicorn/no-process-exit': 'error',
  'unicorn/no-static-only-class': 'error',
  'unicorn/no-thenable': 'error',
  'unicorn/no-this-assignment': 'error',
  'unicorn/no-typeof-undefined': 'error',
  'unicorn/no-unnecessary-await': 'error',
  'unicorn/no-unreadable-array-destructuring': 'error',
  'unicorn/no-unsafe-regex': 'off', // dup of "security/detect-unsafe-regex"
  'unicorn/no-unused-properties': 'error',
  'unicorn/no-useless-fallback-in-spread': 'error',
  'unicorn/no-useless-length-check': 'error',
  'unicorn/no-useless-promise-resolve-reject': 'error',
  'unicorn/no-useless-spread': 'error',
  'unicorn/no-useless-undefined': 'off', // this conflicts with @typescript-eslint/init-declarations
  'unicorn/no-zero-fractions': 'error',
  'unicorn/numeric-separators-style': 'error',
  'unicorn/prefer-add-event-listener': 'error',
  'unicorn/prefer-array-find': 'error',
  'unicorn/prefer-array-flat': 'error',
  'unicorn/prefer-array-flat-map': 'error',
  'unicorn/prefer-array-index-of': 'error',
  'unicorn/prefer-array-some': 'error',
  // TODO: Enable this by default when targeting a Node.js version that supports `Array#at`.
  'unicorn/prefer-at': [
    'error',
    {
      checkAllIndexAccess: false,
    },
  ],
  'unicorn/prefer-code-point': 'error',
  'unicorn/prefer-date-now': 'error',
  'unicorn/prefer-default-parameters': 'error',
  'unicorn/prefer-dom-node-append': 'error',
  'unicorn/prefer-dom-node-dataset': 'error',
  'unicorn/prefer-dom-node-remove': 'error',
  'unicorn/prefer-dom-node-text-content': 'error',
  'unicorn/prefer-export-from': 'error',
  'unicorn/prefer-includes': 'error',
  'unicorn/prefer-json-parse-buffer': 'off',
  'unicorn/prefer-keyboard-event-key': 'error',
  'unicorn/prefer-math-trunc': 'error',
  'unicorn/prefer-modern-dom-apis': 'error',
  'unicorn/prefer-module': 'error',
  'unicorn/prefer-negative-index': 'error',
  'unicorn/prefer-node-protocol': 'off', // TODO: enable this
  'unicorn/prefer-number-properties': 'error',
  'unicorn/prefer-object-from-entries': 'error',
  'unicorn/prefer-optional-catch-binding': 'error',
  'unicorn/prefer-prototype-methods': 'error',
  'unicorn/prefer-query-selector': 'error',
  'unicorn/prefer-reflect-apply': 'error',
  'unicorn/prefer-regexp-test': 'error',
  'unicorn/prefer-set-has': 'error',
  'unicorn/prefer-set-size': 'error',
  'unicorn/prefer-spread': 'off', // prefer array-func/prefer-array-from
  // TODO: Enable this by default when targeting Node.js 16.
  'unicorn/prefer-string-replace-all': 'error',
  'unicorn/prefer-string-slice': 'error',
  'unicorn/prefer-string-starts-ends-with': 'error',
  'unicorn/prefer-string-trim-start-end': 'error',
  'unicorn/prefer-switch': [
    'error',
    { minimumCases: 2, emptyDefaultCase: 'no-default-case' },
  ],
  'unicorn/prefer-ternary': ['error', 'only-single-line'],
  // TODO: Enable this by default when targeting Node.js 14.
  'unicorn/prefer-top-level-await': 'off',
  'unicorn/prefer-type-error': 'error',
  'unicorn/prevent-abbreviations': 'off',
  'unicorn/relative-url-style': 'error',
  'unicorn/require-array-join-separator': 'error',
  'unicorn/require-number-to-fixed-digits-argument': 'error',
  // Turned off because we can't distinguish `widow.postMessage` and `{Worker,MessagePort,Client,BroadcastChannel}#postMessage()`
  // See #1396
  'unicorn/require-post-message-target-origin': 'off',
  'unicorn/string-content': 'error',
  'unicorn/switch-case-braces': 'off', // TODO: Enable this
  'unicorn/template-indent': 'error',
  'unicorn/text-encoding-identifier-case': 'error',
  'unicorn/throw-new-error': 'error',
  'unicorn/no-unreadable-iife': 'error',
  'unicorn/no-useless-switch-case': 'error',
  'unicorn/prefer-modern-math-apis': 'error',
  'unicorn/prefer-native-coercion-functions': 'error',
  'unicorn/prefer-event-target': 'error',
  'unicorn/prefer-logical-operator-over-ternary': 'error',
  'unicorn/prefer-blob-reading-methods': 'error',
  'unicorn/no-unnecessary-polyfills': 'error',
  'unicorn/no-anonymous-default-export': 'error',
  'unicorn/no-await-in-promise-methods': 'error',
  'unicorn/no-single-promise-in-promise-methods': 'error',

  // deprecated rules
  'unicorn/import-index': 'off',
  'unicorn/no-array-instanceof': 'off',
  'unicorn/no-fn-reference-in-iterator': 'off',
  'unicorn/no-reduce': 'off',
  'unicorn/prefer-dataset': 'off',
  'unicorn/prefer-event-key': 'off',
  'unicorn/prefer-exponentiation-operator': 'off',
  'unicorn/prefer-flat-map': 'off',
  'unicorn/prefer-node-append': 'off',
  'unicorn/prefer-node-remove': 'off',
  'unicorn/prefer-object-has-own': 'off',
  'unicorn/prefer-replace-all': 'off',
  'unicorn/prefer-starts-ends-with': 'off',
  'unicorn/prefer-text-content': 'off',
  'unicorn/prefer-trim-start-end': 'off',
  'unicorn/regex-shorthand': 'off',
};
