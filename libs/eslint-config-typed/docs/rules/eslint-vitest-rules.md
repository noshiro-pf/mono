[**eslint-config-typed**](../README.md)

***

[eslint-config-typed](../README.md) / rules/eslint-vitest-rules

# rules/eslint-vitest-rules

## Variables

### eslintVitestRules

> `const` **eslintVitestRules**: `object`

Defined in: [src/rules/eslint-vitest-rules.mts:3](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/rules/eslint-vitest-rules.mts#L3)

#### Type Declaration

##### vitest/consistent-test-filename

> `readonly` **vitest/consistent-test-filename**: `1` \| `2`

##### vitest/consistent-test-it

> `readonly` **vitest/consistent-test-it**: readonly \[`"error"`, \{ `fn`: `"test"`; \}\]

##### vitest/expect-expect

> `readonly` **vitest/expect-expect**: `1` \| `2`

##### vitest/max-expects

> `readonly` **vitest/max-expects**: `"off"` = `'off'`

##### vitest/max-nested-describe

> `readonly` **vitest/max-nested-describe**: `1` \| `2`

##### vitest/no-alias-methods

> `readonly` **vitest/no-alias-methods**: `"error"` = `'error'`

##### vitest/no-commented-out-tests

> `readonly` **vitest/no-commented-out-tests**: `"off"` = `'off'`

##### vitest/no-conditional-expect

> `readonly` **vitest/no-conditional-expect**: `"error"` = `'error'`

##### vitest/no-conditional-in-test

> `readonly` **vitest/no-conditional-in-test**: `"off"` = `'off'`

##### vitest/no-conditional-tests

> `readonly` **vitest/no-conditional-tests**: `"off"` = `'off'`

##### vitest/no-disabled-tests

> `readonly` **vitest/no-disabled-tests**: `"error"` = `'error'`

##### vitest/no-done-callback

> `readonly` **vitest/no-done-callback**: `0` = `0`

##### vitest/no-duplicate-hooks

> `readonly` **vitest/no-duplicate-hooks**: `"error"` = `'error'`

##### vitest/no-focused-tests

> `readonly` **vitest/no-focused-tests**: `1` \| `2`

##### vitest/no-hooks

> `readonly` **vitest/no-hooks**: `1` \| `2`

##### vitest/no-identical-title

> `readonly` **vitest/no-identical-title**: `"error"` = `'error'`

##### vitest/no-import-node-test

> `readonly` **vitest/no-import-node-test**: `"error"` = `'error'`

##### vitest/no-interpolation-in-snapshots

> `readonly` **vitest/no-interpolation-in-snapshots**: `"error"` = `'error'`

##### vitest/no-large-snapshots

> `readonly` **vitest/no-large-snapshots**: `1` \| `2`

##### vitest/no-mocks-import

> `readonly` **vitest/no-mocks-import**: `"error"` = `'error'`

##### vitest/no-restricted-matchers

> `readonly` **vitest/no-restricted-matchers**: readonly \[`"error"`, \{ `toBeFalsy`: `` "Use `.toBe(false)` instead." ``; `toBeTruthy`: `` "Use `.toBe(true)` instead." ``; \}\]

##### vitest/no-restricted-vi-methods

> `readonly` **vitest/no-restricted-vi-methods**: readonly \[`"error"`, \{ `advanceTimersByTime`: `null`; `spyOn`: `null`; \}\]

##### vitest/no-standalone-expect

> `readonly` **vitest/no-standalone-expect**: `1` \| `2`

##### vitest/no-test-prefixes

> `readonly` **vitest/no-test-prefixes**: `"error"` = `'error'`

##### vitest/no-test-return-statement

> `readonly` **vitest/no-test-return-statement**: `"error"` = `'error'`

##### vitest/prefer-called-with

> `readonly` **vitest/prefer-called-with**: `"error"` = `'error'`

##### vitest/prefer-comparison-matcher

> `readonly` **vitest/prefer-comparison-matcher**: `"error"` = `'error'`

##### vitest/prefer-each

> `readonly` **vitest/prefer-each**: `"error"` = `'error'`

##### vitest/prefer-equality-matcher

> `readonly` **vitest/prefer-equality-matcher**: `"error"` = `'error'`

##### vitest/prefer-expect-assertions

> `readonly` **vitest/prefer-expect-assertions**: `"off"` = `'off'`

##### vitest/prefer-expect-resolves

> `readonly` **vitest/prefer-expect-resolves**: `"error"` = `'error'`

##### vitest/prefer-hooks-in-order

> `readonly` **vitest/prefer-hooks-in-order**: `"error"` = `'error'`

##### vitest/prefer-hooks-on-top

> `readonly` **vitest/prefer-hooks-on-top**: `"error"` = `'error'`

##### vitest/prefer-lowercase-title

> `readonly` **vitest/prefer-lowercase-title**: `"off"` = `'off'`

##### vitest/prefer-mock-promise-shorthand

> `readonly` **vitest/prefer-mock-promise-shorthand**: `"error"` = `'error'`

##### vitest/prefer-snapshot-hint

> `readonly` **vitest/prefer-snapshot-hint**: `1` \| `2`

##### vitest/prefer-spy-on

> `readonly` **vitest/prefer-spy-on**: `"error"` = `'error'`

##### vitest/prefer-strict-equal

> `readonly` **vitest/prefer-strict-equal**: `"error"` = `'error'`

##### vitest/prefer-to-be

> `readonly` **vitest/prefer-to-be**: `"error"` = `'error'`

##### vitest/prefer-to-be-falsy

> `readonly` **vitest/prefer-to-be-falsy**: `"off"` = `'off'`

##### vitest/prefer-to-be-object

> `readonly` **vitest/prefer-to-be-object**: `"error"` = `'error'`

##### vitest/prefer-to-be-truthy

> `readonly` **vitest/prefer-to-be-truthy**: `"off"` = `'off'`

##### vitest/prefer-to-contain

> `readonly` **vitest/prefer-to-contain**: `"error"` = `'error'`

##### vitest/prefer-to-have-length

> `readonly` **vitest/prefer-to-have-length**: `"error"` = `'error'`

##### vitest/prefer-todo

> `readonly` **vitest/prefer-todo**: `"error"` = `'error'`

##### vitest/require-hook

> `readonly` **vitest/require-hook**: `"off"` = `'off'`

##### vitest/require-local-test-context-for-concurrent-snapshots

> `readonly` **vitest/require-local-test-context-for-concurrent-snapshots**: `"error"` = `'error'`

##### vitest/require-to-throw-message

> `readonly` **vitest/require-to-throw-message**: `"error"` = `'error'`

##### vitest/require-top-level-describe

> `readonly` **vitest/require-top-level-describe**: `"off"` = `'off'`

##### vitest/valid-describe-callback

> `readonly` **vitest/valid-describe-callback**: `"error"` = `'error'`

##### vitest/valid-expect

> `readonly` **vitest/valid-expect**: `1` \| `2`

##### vitest/valid-title

> `readonly` **vitest/valid-title**: `"off"` = `'off'`
