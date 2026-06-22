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
  'unicorn/no-array-method-this-argument': 'off', // not compatible with the Arr.map utility in ts-data-forge
  'unicorn/no-array-reduce': 'off',
  'unicorn/no-await-expression-member': 'error',
  'unicorn/no-console-spaces': 'off', // turned off to allow aligning output
  'unicorn/no-empty-file': withDefaultOption('error'),
  'unicorn/no-for-loop': 'error',
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
  'unicorn/no-unreadable-array-destructuring': withDefaultOption('error'),
  'unicorn/no-unused-properties': 'error',
  // Its autofix rewrites `...(cond ? { x } : {})` into `...(cond && { x })`,
  // making the `&&` right-hand side a non-boolean object. That contradicts the
  // boolean-only logical-operand policy enforced by
  // `@typescript-eslint/strict-boolean-expressions`, so keep the explicit ternary.
  'unicorn/no-useless-fallback-in-spread': 'off',
  'unicorn/no-useless-length-check': 'error',
  'unicorn/no-useless-promise-resolve-reject': 'error',
  'unicorn/no-useless-spread': 'error',
  'unicorn/no-useless-undefined': 'off', // this conflicts with @typescript-eslint/init-declarations
  'unicorn/no-zero-fractions': 'error',
  'unicorn/numeric-separators-style': 'off',
  'unicorn/prefer-add-event-listener': withDefaultOption('error'),
  'unicorn/prefer-array-find': 'off', // Covered by @typescript-eslint/prefer-find
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

  // Covered by math/prefer-math-trunc (more specific for mathematical truncation)
  'unicorn/prefer-math-trunc': 'off',

  'unicorn/prefer-negative-index': 'error',
  'unicorn/prefer-number-properties': withDefaultOption('error'),
  'unicorn/prefer-object-from-entries': withDefaultOption('error'),
  'unicorn/prefer-optional-catch-binding': 'error',
  'unicorn/prefer-prototype-methods': 'error',
  'unicorn/prefer-reflect-apply': 'error',
  'unicorn/prefer-regexp-test': 'error',
  'unicorn/prefer-set-has': withDefaultOption('error'),
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
  'unicorn/dom-node-dataset': withDefaultOption('error'),
  'unicorn/prefer-dom-node-remove': 'error',
  'unicorn/prefer-dom-node-text-content': 'error',
  'unicorn/prefer-event-target': 'error',
  'unicorn/prefer-keyboard-event-key': 'error',
  'unicorn/prefer-modern-dom-apis': 'error',
  'unicorn/prefer-query-selector': withDefaultOption('error'),
  // Turned off because we can't distinguish `widow.postMessage` and `{Worker,MessagePort,Client,BroadcastChannel}#postMessage()`
  // See #1396
  'unicorn/require-post-message-target-origin': 'off',

  'unicorn/no-immediate-mutation': 'error',
  'unicorn/no-useless-collection-argument': 'error',
  'unicorn/prefer-response-static-json': 'error',
  'unicorn/isolated-functions': 'off',
  'unicorn/consistent-template-literal-escape': 'error',
  'unicorn/no-useless-iterator-to-array': 'error',
  'unicorn/prefer-simple-condition-first': 'error',
  'unicorn/switch-case-break-position': 'error',

  // Rules added in eslint-plugin-unicorn v66
  'unicorn/better-dom-traversing': 'error',
  'unicorn/class-reference-in-static-methods': withDefaultOption('error'),
  'unicorn/comment-content': 'off',
  // [
  //   'error',
  //   {
  //     replacements: {
  //       // `typescript` appears lowercase as a package/identifier name in comments
  //       // (e.g. `@typescript/eslint-parser`, the `typescript:` resolver key), so do
  //       // not rewrite it to `TypeScript`. The key must match the default rule's
  //       // regex source exactly to override it.
  //       '\\btypescript\\b': false,
  //       '\\burl\\b': false,
  //     },
  //   },
  // ],
  'unicorn/consistent-class-member-order': withDefaultOption('error'),
  'unicorn/consistent-compound-words': withDefaultOption('error'),
  'unicorn/consistent-export-decorator-position': withDefaultOption('error'),
  'unicorn/consistent-function-style': 'off',
  'unicorn/consistent-json-file-read': withDefaultOption('error'),
  'unicorn/consistent-optional-chaining': 'error',
  'unicorn/explicit-timer-delay': withDefaultOption('error'), // TODO: check this by enabling strict-ts-lib
  'unicorn/id-match': withDefaultOption('error'),
  'unicorn/max-nested-calls': withDefaultOption('error'),
  'unicorn/no-array-fill-with-reference-type': 'error', // TODO: check this by enabling strict-ts-lib
  'unicorn/no-array-from-fill': 'error',
  // Conflicts with the standard JSDoc `*`-prefixed comment style used across this repo
  'unicorn/no-asterisk-prefix-in-documentation-comments': 'off',
  'unicorn/no-blob-to-file': 'error',
  'unicorn/no-break-in-nested-loop': 'error',
  'unicorn/no-canvas-to-image': 'error',
  'unicorn/no-computed-property-existence-check': 'error',
  'unicorn/no-confusing-array-splice': 'error',
  'unicorn/no-confusing-array-with': 'error',
  'unicorn/no-declarations-before-early-exit': 'error',
  'unicorn/no-duplicate-loops': 'error',
  'unicorn/no-duplicate-set-values': 'error',
  'unicorn/no-error-property-assignment': 'error',
  'unicorn/no-exports-in-scripts': 'error',
  'unicorn/no-for-each': 'error',
  'unicorn/no-global-object-property-assignment': 'error',
  'unicorn/no-incorrect-query-selector': 'error',
  'unicorn/no-incorrect-template-string-interpolation': 'error',
  'unicorn/no-invalid-argument-count': 'error',
  'unicorn/no-invalid-file-input-accept': 'error',
  'unicorn/no-late-current-target-access': 'error',
  // Its autofix collapses intentionally multi-line `//` comments into one long
  // line, which hurts readability; there is no option to opt out, so disable it.
  'unicorn/no-manually-wrapped-comments': 'off',
  'unicorn/no-mismatched-map-key': 'error',
  'unicorn/no-negated-array-predicate': 'error',
  'unicorn/no-negated-comparison': withDefaultOption('error'),
  'unicorn/no-object-methods-with-collections': 'error',
  'unicorn/no-optional-chaining-on-undeclared-variable': 'error',
  'unicorn/no-redundant-comparison': 'error',
  'unicorn/no-return-array-push': 'error',
  'unicorn/no-subtraction-comparison': 'error',
  'unicorn/no-this-outside-of-class': 'error',
  'unicorn/no-top-level-side-effects': 'error',
  'unicorn/no-undeclared-class-members': 'error',
  'unicorn/no-unnecessary-global-this': 'error',
  'unicorn/no-unnecessary-nested-ternary': 'error',
  'unicorn/no-unnecessary-splice': 'error',
  'unicorn/no-unreadable-new-expression': 'error',
  'unicorn/no-unreadable-object-destructuring': 'error',
  'unicorn/no-unsafe-buffer-conversion': 'error',
  'unicorn/no-unsafe-dom-html': 'error',
  'unicorn/no-unsafe-property-key': 'error',
  'unicorn/no-unsafe-string-replacement': 'error',
  'unicorn/no-unused-array-method-return': 'error',
  'unicorn/no-useless-boolean-cast': 'error',
  'unicorn/no-useless-concat': 'error',
  'unicorn/no-useless-else': 'error',
  'unicorn/no-useless-recursion': 'error',
  'unicorn/no-useless-template-literals': 'error',
  'unicorn/prefer-add-event-listener-options': 'error',
  'unicorn/prefer-array-from-map': 'error',
  'unicorn/prefer-array-last-methods': 'error',
  'unicorn/prefer-await': 'error',
  'unicorn/prefer-direct-iteration': 'error',
  'unicorn/prefer-dispose': 'error',
  'unicorn/prefer-dom-node-html-methods': 'error',
  'unicorn/prefer-early-return': withDefaultOption('error'),
  'unicorn/prefer-get-or-insert-computed': 'error',
  'unicorn/prefer-global-number-constants': 'error',
  'unicorn/prefer-https': 'error',
  'unicorn/prefer-identifier-import-export-specifiers': 'error',
  'unicorn/prefer-includes-over-repeated-comparisons':
    withDefaultOption('error'),
  'unicorn/prefer-iterable-in-constructor': 'error',
  'unicorn/prefer-iterator-concat': 'error',
  'unicorn/prefer-iterator-to-array': 'error',
  'unicorn/prefer-iterator-to-array-at-end': 'error',
  'unicorn/prefer-location-assign': 'error',
  'unicorn/prefer-math-abs': 'error',
  'unicorn/prefer-minimal-ternary': 'error',
  'unicorn/prefer-number-coercion': 'error',
  'unicorn/prefer-number-is-safe-integer': 'error',
  'unicorn/prefer-object-define-properties': 'error',
  'unicorn/prefer-object-destructuring-defaults': 'error',
  'unicorn/prefer-object-iterable-methods': 'error',
  'unicorn/prefer-path2d': 'error',
  'unicorn/prefer-private-class-fields': 'error',
  'unicorn/prefer-queue-microtask': withDefaultOption('error'),
  'unicorn/prefer-scoped-selector': 'error',
  'unicorn/prefer-short-arrow-method': 'error',
  'unicorn/prefer-simple-sort-comparator': 'error',
  'unicorn/prefer-single-array-predicate': 'error',
  'unicorn/prefer-single-object-destructuring': 'error',
  'unicorn/prefer-smaller-scope': 'error',
  'unicorn/prefer-split-limit': 'error',
  'unicorn/prefer-string-match-all': 'error',
  'unicorn/prefer-string-pad-start-end': 'error',
  'unicorn/prefer-string-repeat': withDefaultOption('error'),
  'unicorn/prefer-temporal': withDefaultOption('error'),
  'unicorn/prefer-type-literal-last': 'error',
  'unicorn/prefer-uint8array-base64': 'error',
  'unicorn/prefer-unicode-code-point-escapes': 'error',
  'unicorn/prefer-url-href': 'error',
  'unicorn/require-array-sort-compare': 'error',
  'unicorn/require-css-escape': withDefaultOption('error'),
  'unicorn/require-passive-events': 'error',
  'unicorn/require-proxy-trap-boolean-return': 'error',
  // Default `maxComplexity` of 1 is too strict for real-world try blocks
  'unicorn/try-complexity': 'off',

  // For Node.js environment only
  'unicorn/no-new-buffer': 'error',
  'unicorn/no-process-exit': 'off',
  'unicorn/prefer-json-parse-buffer': 0,
  'unicorn/prefer-module': 'error',
  'unicorn/prefer-node-protocol': 'error',

  // deprecated rules
  'unicorn/better-regex': 0, // removed in v66
  'unicorn/no-hex-escape': 0, // removed in v66
  'unicorn/prefer-dom-node-dataset': 0, // renamed to unicorn/dom-node-dataset in v66
  'unicorn/no-array-push-push': 0,
  'unicorn/no-instanceof-array': 0,
  'unicorn/no-length-as-slice-end': 0,
} as const satisfies EslintUnicornRules;
