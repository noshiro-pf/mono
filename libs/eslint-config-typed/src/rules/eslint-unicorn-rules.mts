import { withDefaultOption, type EslintUnicornRules } from '../types/index.mjs';

export const eslintUnicornRules = {
  /**
   * Disable in favor of prettier
   *
   * @link https://github.com/prettier/eslint-config-prettier/blob/main/index.js
   */
  'unicorn/empty-brace-spaces': 'off',
  'unicorn/no-nested-ternary': 'off',
  'unicorn/number-literal-case': 'off',

  'unicorn/better-regex': withDefaultOption('error'),
  'unicorn/catch-error-name': withDefaultOption('error'),

  /** Enforce consistent usage of destructuring. */
  'unicorn/consistent-destructuring': 'error',

  'unicorn/consistent-function-scoping': withDefaultOption('error'),
  'unicorn/custom-error-definition': 'off',
  'unicorn/error-message': 'error',
  'unicorn/escape-case': withDefaultOption('error'),
  'unicorn/expiring-todo-comments': withDefaultOption('error'),
  'unicorn/explicit-length-check': 'off',

  /** Enforce consistent file naming */
  'unicorn/filename-case': [
    'error',
    {
      case: 'kebabCase',
      ignore: ['serviceWorker.ts', 'setupTests.ts'],
    },
  ],

  'unicorn/import-style': [
    'error',
    {
      styles: {
        util: {
          namespace: true,
          named: false,
        },
        'node:util': {
          namespace: true,
          named: false,
        },
        path: {
          namespace: true,
          named: false,
        },
        'node:path': {
          namespace: true,
          named: false,
        },
      },
    },
  ],

  'unicorn/prefer-spread': 'off', // Conflicts with array-func/prefer-array-from
  'unicorn/no-new-array': 'error',
  'unicorn/new-for-builtins': 'error',

  'unicorn/no-abusive-eslint-disable': 'error',
  'unicorn/no-array-callback-reference': 'off',
  'unicorn/no-array-for-each': 'error',
  'unicorn/no-array-method-this-argument': 'off', // not compatible with the Arr.map utility in ts-data-forge
  'unicorn/no-array-reduce': 'off',
  'unicorn/no-await-expression-member': 'error',
  'unicorn/no-console-spaces': 'off', // turned off to allow aligning output
  'unicorn/no-empty-file': 'error',
  'unicorn/no-for-loop': 'error',
  'unicorn/no-hex-escape': 'error',
  'unicorn/no-keyword-prefix': 'off', // {"onlyCamelCase": false}
  'unicorn/no-lonely-if': 'error',
  'unicorn/no-negated-condition': 'off',
  'unicorn/no-null': 'off',
  'unicorn/no-object-as-default-parameter': 'error',
  'unicorn/no-static-only-class': 'error',
  'unicorn/no-thenable': 'error',
  'unicorn/no-this-assignment': 'error',
  'unicorn/no-typeof-undefined': withDefaultOption('error'),
  'unicorn/no-unnecessary-await': 'error',
  'unicorn/no-unreadable-array-destructuring': 'error',
  'unicorn/no-unused-properties': 'error',
  'unicorn/no-useless-fallback-in-spread': 'error',
  'unicorn/no-useless-length-check': 'error',
  'unicorn/no-useless-promise-resolve-reject': 'error',
  'unicorn/no-useless-spread': 'error',
  'unicorn/no-useless-undefined': 'off', // this conflicts with @typescript-eslint/init-declarations
  'unicorn/no-zero-fractions': 'error',
  'unicorn/numeric-separators-style': 'off',
  'unicorn/prefer-add-event-listener': withDefaultOption('error'),
  'unicorn/prefer-array-find': withDefaultOption('error'),
  'unicorn/prefer-array-flat': withDefaultOption('error'),
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
  'unicorn/prefer-export-from': withDefaultOption('error'),
  'unicorn/prefer-includes': 'error',
  'unicorn/prefer-math-trunc': 'error',
  'unicorn/prefer-negative-index': 'error',
  'unicorn/prefer-number-properties': withDefaultOption('error'),
  'unicorn/prefer-object-from-entries': withDefaultOption('error'),
  'unicorn/prefer-optional-catch-binding': 'error',
  'unicorn/prefer-prototype-methods': 'error',
  'unicorn/prefer-reflect-apply': 'error',
  'unicorn/prefer-regexp-test': 'error',
  'unicorn/prefer-set-has': 'error',
  'unicorn/prefer-set-size': 'error',
  'unicorn/prefer-string-replace-all': 'error',
  'unicorn/prefer-string-slice': 'error',
  'unicorn/prefer-string-starts-ends-with': 'error',
  'unicorn/prefer-string-trim-start-end': 'error',
  'unicorn/prefer-switch': [
    'error',
    { minimumCases: 2, emptyDefaultCase: 'no-default-case' },
  ],
  'unicorn/prefer-ternary': ['error', 'only-single-line'],
  'unicorn/prefer-top-level-await': 'error',
  'unicorn/prefer-type-error': 'error',
  'unicorn/prevent-abbreviations': 'off',
  'unicorn/relative-url-style': withDefaultOption('error'),
  'unicorn/require-array-join-separator': 'error',
  'unicorn/require-number-to-fixed-digits-argument': 'error',
  'unicorn/string-content': withDefaultOption('error'),
  'unicorn/switch-case-braces': 'off', // TODO: Enable this
  'unicorn/template-indent': withDefaultOption('error'),
  'unicorn/text-encoding-identifier-case': withDefaultOption('error'),
  'unicorn/throw-new-error': 'error',
  'unicorn/no-unreadable-iife': 'error',
  'unicorn/no-useless-switch-case': 'error',
  'unicorn/prefer-modern-math-apis': 'error',

  /**
   * Reasons for turning it off: `.some(b => b)` is better than `.some(Boolean)`
   * because `Boolean` coerce non-boolean type to boolean.
   *
   * See also `@typescript-eslint/strict-boolean-expressions`.
   */
  'unicorn/prefer-native-coercion-functions': 'off',

  'unicorn/prefer-logical-operator-over-ternary': 'error',
  'unicorn/no-unnecessary-polyfills': withDefaultOption('error'),
  'unicorn/no-anonymous-default-export': 'error',
  'unicorn/no-await-in-promise-methods': 'error',
  'unicorn/no-single-promise-in-promise-methods': 'error',
  'unicorn/consistent-empty-array-spread': 'error',
  'unicorn/no-magic-array-flat-depth': 'error',
  'unicorn/prefer-string-raw': 'error',
  'unicorn/prefer-structured-clone': withDefaultOption('error'),
  'unicorn/no-negation-in-equality-check': 'error',
  'unicorn/consistent-existence-index-check': 'error',
  'unicorn/prefer-global-this': 'error',
  'unicorn/prefer-math-min-max': 'error',

  'unicorn/no-instanceof-builtins': [
    'error',
    {
      strategy: 'strict',
      useErrorIsError: true,
    },
  ],
  'unicorn/consistent-assert': 'error',
  'unicorn/consistent-date-clone': 'error',
  'unicorn/no-accessor-recursion': 'error',
  'unicorn/no-array-reverse': withDefaultOption('error'),
  'unicorn/no-array-sort': withDefaultOption('error'),
  'unicorn/no-named-default': 'error',
  'unicorn/no-unnecessary-array-flat-depth': 'error',
  'unicorn/no-unnecessary-array-splice-count': 'error',
  'unicorn/no-unnecessary-slice-end': 'error',
  'unicorn/no-useless-error-capture-stack-trace': 'error',
  'unicorn/prefer-bigint-literals': 'error',
  'unicorn/prefer-class-fields': 'error',
  'unicorn/prefer-import-meta-properties': 'error',
  'unicorn/prefer-single-call': withDefaultOption('error'),
  'unicorn/require-module-attributes': 'error',
  'unicorn/require-module-specifiers': 'error',

  // For browser environment only
  'unicorn/no-document-cookie': 'error',
  'unicorn/no-invalid-fetch-options': 'error',
  'unicorn/no-invalid-remove-event-listener': 'error',
  'unicorn/prefer-blob-reading-methods': 'error',
  'unicorn/prefer-classlist-toggle': 'error',
  'unicorn/prefer-dom-node-append': 'error',
  'unicorn/prefer-dom-node-dataset': 'error',
  'unicorn/prefer-dom-node-remove': 'error',
  'unicorn/prefer-dom-node-text-content': 'error',
  'unicorn/prefer-event-target': 'error',
  'unicorn/prefer-keyboard-event-key': 'error',
  'unicorn/prefer-modern-dom-apis': 'error',
  'unicorn/prefer-query-selector': 'error',
  // Turned off because we can't distinguish `widow.postMessage` and `{Worker,MessagePort,Client,BroadcastChannel}#postMessage()`
  // See #1396
  'unicorn/require-post-message-target-origin': 'off',

  'unicorn/no-immediate-mutation': 'error',
  'unicorn/no-useless-collection-argument': 'error',
  'unicorn/prefer-response-static-json': 'error',

  // For Node.js environment only
  'unicorn/no-new-buffer': 'error',
  'unicorn/no-process-exit': 'off',
  'unicorn/prefer-json-parse-buffer': 'off',
  'unicorn/prefer-module': 'error',
  'unicorn/prefer-node-protocol': 'error',

  // deprecated rules
  'unicorn/no-array-push-push': 0,
  'unicorn/no-instanceof-array': 0,
  'unicorn/no-length-as-slice-end': 0,
} as const satisfies EslintUnicornRules;
