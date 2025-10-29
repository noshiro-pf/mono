[**eslint-config-typed**](../README.md)

***

[eslint-config-typed](../README.md) / rules/eslint-unicorn-rules

# rules/eslint-unicorn-rules

## Variables

### eslintUnicornRules

> `const` **eslintUnicornRules**: `object`

Defined in: [src/rules/eslint-unicorn-rules.mts:3](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/rules/eslint-unicorn-rules.mts#L3)

#### Type Declaration

##### unicorn/better-regex

> `readonly` **unicorn/better-regex**: `1` \| `2`

##### unicorn/catch-error-name

> `readonly` **unicorn/catch-error-name**: `1` \| `2`

##### unicorn/consistent-assert

> `readonly` **unicorn/consistent-assert**: `"error"` = `'error'`

##### unicorn/consistent-date-clone

> `readonly` **unicorn/consistent-date-clone**: `"error"` = `'error'`

##### unicorn/consistent-destructuring

> `readonly` **unicorn/consistent-destructuring**: `"error"` = `'error'`

Enforce consistent usage of destructuring.

##### unicorn/consistent-empty-array-spread

> `readonly` **unicorn/consistent-empty-array-spread**: `"error"` = `'error'`

##### unicorn/consistent-existence-index-check

> `readonly` **unicorn/consistent-existence-index-check**: `"error"` = `'error'`

##### unicorn/consistent-function-scoping

> `readonly` **unicorn/consistent-function-scoping**: `1` \| `2`

##### unicorn/custom-error-definition

> `readonly` **unicorn/custom-error-definition**: `"off"` = `'off'`

##### unicorn/empty-brace-spaces

> `readonly` **unicorn/empty-brace-spaces**: `"off"` = `'off'`

Disable in favor of prettier

###### Link

https://github.com/prettier/eslint-config-prettier/blob/main/index.js

##### unicorn/error-message

> `readonly` **unicorn/error-message**: `"error"` = `'error'`

##### unicorn/escape-case

> `readonly` **unicorn/escape-case**: `1` \| `2`

##### unicorn/expiring-todo-comments

> `readonly` **unicorn/expiring-todo-comments**: `1` \| `2`

##### unicorn/explicit-length-check

> `readonly` **unicorn/explicit-length-check**: `"off"` = `'off'`

##### unicorn/filename-case

> `readonly` **unicorn/filename-case**: readonly \[`"error"`, \{ `case`: `"kebabCase"`; `ignore`: readonly \[`"serviceWorker.ts"`, `"setupTests.ts"`\]; \}\]

Enforce consistent file naming

##### unicorn/import-style

> `readonly` **unicorn/import-style**: readonly \[`"error"`, \{ `styles`: \{ `node:path`: \{ `named`: `false`; `namespace`: `true`; \}; `node:util`: \{ `named`: `false`; `namespace`: `true`; \}; `path`: \{ `named`: `false`; `namespace`: `true`; \}; `util`: \{ `named`: `false`; `namespace`: `true`; \}; \}; \}\]

##### unicorn/new-for-builtins

> `readonly` **unicorn/new-for-builtins**: `"error"` = `'error'`

##### unicorn/no-abusive-eslint-disable

> `readonly` **unicorn/no-abusive-eslint-disable**: `"error"` = `'error'`

##### unicorn/no-accessor-recursion

> `readonly` **unicorn/no-accessor-recursion**: `"error"` = `'error'`

##### unicorn/no-anonymous-default-export

> `readonly` **unicorn/no-anonymous-default-export**: `"error"` = `'error'`

##### unicorn/no-array-callback-reference

> `readonly` **unicorn/no-array-callback-reference**: `"off"` = `'off'`

##### unicorn/no-array-for-each

> `readonly` **unicorn/no-array-for-each**: `"error"` = `'error'`

##### unicorn/no-array-method-this-argument

> `readonly` **unicorn/no-array-method-this-argument**: `"off"` = `'off'`

##### unicorn/no-array-push-push

> `readonly` **unicorn/no-array-push-push**: `0` = `0`

##### unicorn/no-array-reduce

> `readonly` **unicorn/no-array-reduce**: `"off"` = `'off'`

##### unicorn/no-array-reverse

> `readonly` **unicorn/no-array-reverse**: `1` \| `2`

##### unicorn/no-array-sort

> `readonly` **unicorn/no-array-sort**: `1` \| `2`

##### unicorn/no-await-expression-member

> `readonly` **unicorn/no-await-expression-member**: `"error"` = `'error'`

##### unicorn/no-await-in-promise-methods

> `readonly` **unicorn/no-await-in-promise-methods**: `"error"` = `'error'`

##### unicorn/no-console-spaces

> `readonly` **unicorn/no-console-spaces**: `"off"` = `'off'`

##### unicorn/no-document-cookie

> `readonly` **unicorn/no-document-cookie**: `"error"` = `'error'`

##### unicorn/no-empty-file

> `readonly` **unicorn/no-empty-file**: `"error"` = `'error'`

##### unicorn/no-for-loop

> `readonly` **unicorn/no-for-loop**: `"error"` = `'error'`

##### unicorn/no-hex-escape

> `readonly` **unicorn/no-hex-escape**: `"error"` = `'error'`

##### unicorn/no-immediate-mutation

> `readonly` **unicorn/no-immediate-mutation**: `"error"` = `'error'`

##### unicorn/no-instanceof-array

> `readonly` **unicorn/no-instanceof-array**: `0` = `0`

##### unicorn/no-instanceof-builtins

> `readonly` **unicorn/no-instanceof-builtins**: readonly \[`"error"`, \{ `strategy`: `"strict"`; `useErrorIsError`: `true`; \}\]

##### unicorn/no-invalid-fetch-options

> `readonly` **unicorn/no-invalid-fetch-options**: `"error"` = `'error'`

##### unicorn/no-invalid-remove-event-listener

> `readonly` **unicorn/no-invalid-remove-event-listener**: `"error"` = `'error'`

##### unicorn/no-keyword-prefix

> `readonly` **unicorn/no-keyword-prefix**: `"off"` = `'off'`

##### unicorn/no-length-as-slice-end

> `readonly` **unicorn/no-length-as-slice-end**: `0` = `0`

##### unicorn/no-lonely-if

> `readonly` **unicorn/no-lonely-if**: `"error"` = `'error'`

##### unicorn/no-magic-array-flat-depth

> `readonly` **unicorn/no-magic-array-flat-depth**: `"error"` = `'error'`

##### unicorn/no-named-default

> `readonly` **unicorn/no-named-default**: `"error"` = `'error'`

##### unicorn/no-negated-condition

> `readonly` **unicorn/no-negated-condition**: `"off"` = `'off'`

##### unicorn/no-negation-in-equality-check

> `readonly` **unicorn/no-negation-in-equality-check**: `"error"` = `'error'`

##### unicorn/no-nested-ternary

> `readonly` **unicorn/no-nested-ternary**: `"off"` = `'off'`

##### unicorn/no-new-array

> `readonly` **unicorn/no-new-array**: `"error"` = `'error'`

##### unicorn/no-new-buffer

> `readonly` **unicorn/no-new-buffer**: `"error"` = `'error'`

##### unicorn/no-null

> `readonly` **unicorn/no-null**: `"off"` = `'off'`

##### unicorn/no-object-as-default-parameter

> `readonly` **unicorn/no-object-as-default-parameter**: `"error"` = `'error'`

##### unicorn/no-process-exit

> `readonly` **unicorn/no-process-exit**: `"off"` = `'off'`

##### unicorn/no-single-promise-in-promise-methods

> `readonly` **unicorn/no-single-promise-in-promise-methods**: `"error"` = `'error'`

##### unicorn/no-static-only-class

> `readonly` **unicorn/no-static-only-class**: `"error"` = `'error'`

##### unicorn/no-thenable

> `readonly` **unicorn/no-thenable**: `"error"` = `'error'`

##### unicorn/no-this-assignment

> `readonly` **unicorn/no-this-assignment**: `"error"` = `'error'`

##### unicorn/no-typeof-undefined

> `readonly` **unicorn/no-typeof-undefined**: `1` \| `2`

##### unicorn/no-unnecessary-array-flat-depth

> `readonly` **unicorn/no-unnecessary-array-flat-depth**: `"error"` = `'error'`

##### unicorn/no-unnecessary-array-splice-count

> `readonly` **unicorn/no-unnecessary-array-splice-count**: `"error"` = `'error'`

##### unicorn/no-unnecessary-await

> `readonly` **unicorn/no-unnecessary-await**: `"error"` = `'error'`

##### unicorn/no-unnecessary-polyfills

> `readonly` **unicorn/no-unnecessary-polyfills**: `1` \| `2`

##### unicorn/no-unnecessary-slice-end

> `readonly` **unicorn/no-unnecessary-slice-end**: `"error"` = `'error'`

##### unicorn/no-unreadable-array-destructuring

> `readonly` **unicorn/no-unreadable-array-destructuring**: `"error"` = `'error'`

##### unicorn/no-unreadable-iife

> `readonly` **unicorn/no-unreadable-iife**: `"error"` = `'error'`

##### unicorn/no-unused-properties

> `readonly` **unicorn/no-unused-properties**: `"error"` = `'error'`

##### unicorn/no-useless-collection-argument

> `readonly` **unicorn/no-useless-collection-argument**: `"error"` = `'error'`

##### unicorn/no-useless-error-capture-stack-trace

> `readonly` **unicorn/no-useless-error-capture-stack-trace**: `"error"` = `'error'`

##### unicorn/no-useless-fallback-in-spread

> `readonly` **unicorn/no-useless-fallback-in-spread**: `"error"` = `'error'`

##### unicorn/no-useless-length-check

> `readonly` **unicorn/no-useless-length-check**: `"error"` = `'error'`

##### unicorn/no-useless-promise-resolve-reject

> `readonly` **unicorn/no-useless-promise-resolve-reject**: `"error"` = `'error'`

##### unicorn/no-useless-spread

> `readonly` **unicorn/no-useless-spread**: `"error"` = `'error'`

##### unicorn/no-useless-switch-case

> `readonly` **unicorn/no-useless-switch-case**: `"error"` = `'error'`

##### unicorn/no-useless-undefined

> `readonly` **unicorn/no-useless-undefined**: `"off"` = `'off'`

##### unicorn/no-zero-fractions

> `readonly` **unicorn/no-zero-fractions**: `"error"` = `'error'`

##### unicorn/number-literal-case

> `readonly` **unicorn/number-literal-case**: `"off"` = `'off'`

##### unicorn/numeric-separators-style

> `readonly` **unicorn/numeric-separators-style**: `"off"` = `'off'`

##### unicorn/prefer-add-event-listener

> `readonly` **unicorn/prefer-add-event-listener**: `1` \| `2`

##### unicorn/prefer-array-find

> `readonly` **unicorn/prefer-array-find**: `1` \| `2`

##### unicorn/prefer-array-flat

> `readonly` **unicorn/prefer-array-flat**: `1` \| `2`

##### unicorn/prefer-array-flat-map

> `readonly` **unicorn/prefer-array-flat-map**: `"error"` = `'error'`

##### unicorn/prefer-array-index-of

> `readonly` **unicorn/prefer-array-index-of**: `"error"` = `'error'`

##### unicorn/prefer-array-some

> `readonly` **unicorn/prefer-array-some**: `"error"` = `'error'`

##### unicorn/prefer-at

> `readonly` **unicorn/prefer-at**: readonly \[`"error"`, \{ `checkAllIndexAccess`: `false`; \}\]

##### unicorn/prefer-bigint-literals

> `readonly` **unicorn/prefer-bigint-literals**: `"error"` = `'error'`

##### unicorn/prefer-blob-reading-methods

> `readonly` **unicorn/prefer-blob-reading-methods**: `"error"` = `'error'`

##### unicorn/prefer-class-fields

> `readonly` **unicorn/prefer-class-fields**: `"error"` = `'error'`

##### unicorn/prefer-classlist-toggle

> `readonly` **unicorn/prefer-classlist-toggle**: `"error"` = `'error'`

##### unicorn/prefer-code-point

> `readonly` **unicorn/prefer-code-point**: `"error"` = `'error'`

##### unicorn/prefer-date-now

> `readonly` **unicorn/prefer-date-now**: `"error"` = `'error'`

##### unicorn/prefer-default-parameters

> `readonly` **unicorn/prefer-default-parameters**: `"error"` = `'error'`

##### unicorn/prefer-dom-node-append

> `readonly` **unicorn/prefer-dom-node-append**: `"error"` = `'error'`

##### unicorn/prefer-dom-node-dataset

> `readonly` **unicorn/prefer-dom-node-dataset**: `"error"` = `'error'`

##### unicorn/prefer-dom-node-remove

> `readonly` **unicorn/prefer-dom-node-remove**: `"error"` = `'error'`

##### unicorn/prefer-dom-node-text-content

> `readonly` **unicorn/prefer-dom-node-text-content**: `"error"` = `'error'`

##### unicorn/prefer-event-target

> `readonly` **unicorn/prefer-event-target**: `"error"` = `'error'`

##### unicorn/prefer-export-from

> `readonly` **unicorn/prefer-export-from**: `1` \| `2`

##### unicorn/prefer-global-this

> `readonly` **unicorn/prefer-global-this**: `"error"` = `'error'`

##### unicorn/prefer-import-meta-properties

> `readonly` **unicorn/prefer-import-meta-properties**: `"error"` = `'error'`

##### unicorn/prefer-includes

> `readonly` **unicorn/prefer-includes**: `"error"` = `'error'`

##### unicorn/prefer-json-parse-buffer

> `readonly` **unicorn/prefer-json-parse-buffer**: `"off"` = `'off'`

##### unicorn/prefer-keyboard-event-key

> `readonly` **unicorn/prefer-keyboard-event-key**: `"error"` = `'error'`

##### unicorn/prefer-logical-operator-over-ternary

> `readonly` **unicorn/prefer-logical-operator-over-ternary**: `"error"` = `'error'`

##### unicorn/prefer-math-min-max

> `readonly` **unicorn/prefer-math-min-max**: `"error"` = `'error'`

##### unicorn/prefer-math-trunc

> `readonly` **unicorn/prefer-math-trunc**: `"error"` = `'error'`

##### unicorn/prefer-modern-dom-apis

> `readonly` **unicorn/prefer-modern-dom-apis**: `"error"` = `'error'`

##### unicorn/prefer-modern-math-apis

> `readonly` **unicorn/prefer-modern-math-apis**: `"error"` = `'error'`

##### unicorn/prefer-module

> `readonly` **unicorn/prefer-module**: `"error"` = `'error'`

##### unicorn/prefer-native-coercion-functions

> `readonly` **unicorn/prefer-native-coercion-functions**: `"off"` = `'off'`

Reasons for turning it off: `.some(b => b)` is better than `.some(Boolean)`
because `Boolean` coerce non-boolean type to boolean.

See also `@typescript-eslint/strict-boolean-expressions`.

##### unicorn/prefer-negative-index

> `readonly` **unicorn/prefer-negative-index**: `"error"` = `'error'`

##### unicorn/prefer-node-protocol

> `readonly` **unicorn/prefer-node-protocol**: `"error"` = `'error'`

##### unicorn/prefer-number-properties

> `readonly` **unicorn/prefer-number-properties**: `1` \| `2`

##### unicorn/prefer-object-from-entries

> `readonly` **unicorn/prefer-object-from-entries**: `1` \| `2`

##### unicorn/prefer-optional-catch-binding

> `readonly` **unicorn/prefer-optional-catch-binding**: `"error"` = `'error'`

##### unicorn/prefer-prototype-methods

> `readonly` **unicorn/prefer-prototype-methods**: `"error"` = `'error'`

##### unicorn/prefer-query-selector

> `readonly` **unicorn/prefer-query-selector**: `"error"` = `'error'`

##### unicorn/prefer-reflect-apply

> `readonly` **unicorn/prefer-reflect-apply**: `"error"` = `'error'`

##### unicorn/prefer-regexp-test

> `readonly` **unicorn/prefer-regexp-test**: `"error"` = `'error'`

##### unicorn/prefer-response-static-json

> `readonly` **unicorn/prefer-response-static-json**: `"error"` = `'error'`

##### unicorn/prefer-set-has

> `readonly` **unicorn/prefer-set-has**: `"error"` = `'error'`

##### unicorn/prefer-set-size

> `readonly` **unicorn/prefer-set-size**: `"error"` = `'error'`

##### unicorn/prefer-single-call

> `readonly` **unicorn/prefer-single-call**: `1` \| `2`

##### unicorn/prefer-spread

> `readonly` **unicorn/prefer-spread**: `"off"` = `'off'`

##### unicorn/prefer-string-raw

> `readonly` **unicorn/prefer-string-raw**: `"error"` = `'error'`

##### unicorn/prefer-string-replace-all

> `readonly` **unicorn/prefer-string-replace-all**: `"error"` = `'error'`

##### unicorn/prefer-string-slice

> `readonly` **unicorn/prefer-string-slice**: `"error"` = `'error'`

##### unicorn/prefer-string-starts-ends-with

> `readonly` **unicorn/prefer-string-starts-ends-with**: `"error"` = `'error'`

##### unicorn/prefer-string-trim-start-end

> `readonly` **unicorn/prefer-string-trim-start-end**: `"error"` = `'error'`

##### unicorn/prefer-structured-clone

> `readonly` **unicorn/prefer-structured-clone**: `1` \| `2`

##### unicorn/prefer-switch

> `readonly` **unicorn/prefer-switch**: readonly \[`"error"`, \{ `emptyDefaultCase`: `"no-default-case"`; `minimumCases`: `2`; \}\]

##### unicorn/prefer-ternary

> `readonly` **unicorn/prefer-ternary**: readonly \[`"error"`, `"only-single-line"`\]

##### unicorn/prefer-top-level-await

> `readonly` **unicorn/prefer-top-level-await**: `"error"` = `'error'`

##### unicorn/prefer-type-error

> `readonly` **unicorn/prefer-type-error**: `"error"` = `'error'`

##### unicorn/prevent-abbreviations

> `readonly` **unicorn/prevent-abbreviations**: `"off"` = `'off'`

##### unicorn/relative-url-style

> `readonly` **unicorn/relative-url-style**: `1` \| `2`

##### unicorn/require-array-join-separator

> `readonly` **unicorn/require-array-join-separator**: `"error"` = `'error'`

##### unicorn/require-module-attributes

> `readonly` **unicorn/require-module-attributes**: `"error"` = `'error'`

##### unicorn/require-module-specifiers

> `readonly` **unicorn/require-module-specifiers**: `"error"` = `'error'`

##### unicorn/require-number-to-fixed-digits-argument

> `readonly` **unicorn/require-number-to-fixed-digits-argument**: `"error"` = `'error'`

##### unicorn/require-post-message-target-origin

> `readonly` **unicorn/require-post-message-target-origin**: `"off"` = `'off'`

##### unicorn/string-content

> `readonly` **unicorn/string-content**: `1` \| `2`

##### unicorn/switch-case-braces

> `readonly` **unicorn/switch-case-braces**: `"off"` = `'off'`

##### unicorn/template-indent

> `readonly` **unicorn/template-indent**: `1` \| `2`

##### unicorn/text-encoding-identifier-case

> `readonly` **unicorn/text-encoding-identifier-case**: `1` \| `2`

##### unicorn/throw-new-error

> `readonly` **unicorn/throw-new-error**: `"error"` = `'error'`
