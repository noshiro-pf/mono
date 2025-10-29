[**eslint-config-typed**](../README.md)

***

[eslint-config-typed](../README.md) / rules/eslint-functional-rules

# rules/eslint-functional-rules

## Variables

### eslintFunctionalRules

> `const` **eslintFunctionalRules**: `object`

Defined in: [src/rules/eslint-functional-rules.mts:14](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/rules/eslint-functional-rules.mts#L14)

#### Type Declaration

##### functional/functional-parameters

> `readonly` **functional/functional-parameters**: `"off"` = `'off'`

##### functional/immutable-data

> `readonly` **functional/immutable-data**: readonly \[`"error"`, \{ `ignoreAccessorPattern`: readonly \[`"**.mut_**"`, `"this.**"`, `"super.**"`, `"**.current.**"`, `"**.displayName"`, `"**.scrollTop"`, `"**.debugLabel"`\]; `ignoreClasses`: `true`; `ignoreIdentifierPattern`: readonly \[`"^draft"`, `"^mut_"`, `"^_mut_"`, `"^#mut_"`, `"this"`, `"super"`, `"window.location.href"`\]; `ignoreImmediateMutation`: `true`; `ignoreNonConstDeclarations`: `false`; \}\]

##### functional/no-class-inheritance

> `readonly` **functional/no-class-inheritance**: `1` \| `2`

##### functional/no-classes

> `readonly` **functional/no-classes**: `"off"` = `'off'`

##### functional/no-conditional-statements

> `readonly` **functional/no-conditional-statements**: `"off"` = `'off'`

##### functional/no-expression-statements

> `readonly` **functional/no-expression-statements**: `"off"` = `'off'`

##### functional/no-let

> `readonly` **functional/no-let**: readonly \[`"error"`, \{ `allowInForLoopInit`: `false`; `allowInFunctions`: `false`; `ignoreIdentifierPattern`: (`"^mut_"` \| `"^_mut_"` \| `"^#mut_"`)[]; \}\]

##### functional/no-loop-statements

> `readonly` **functional/no-loop-statements**: `"off"` = `'off'`

##### functional/no-mixed-types

> `readonly` **functional/no-mixed-types**: `"off"` = `'off'`

##### functional/no-promise-reject

> `readonly` **functional/no-promise-reject**: `"off"` = `'off'`

##### functional/no-return-void

> `readonly` **functional/no-return-void**: `"off"` = `'off'`

##### functional/no-this-expressions

> `readonly` **functional/no-this-expressions**: `"off"` = `'off'`

##### functional/no-throw-statements

> `readonly` **functional/no-throw-statements**: `"off"` = `'off'`

##### functional/no-try-statements

> `readonly` **functional/no-try-statements**: `"off"` = `'off'`

##### functional/prefer-immutable-types

> `readonly` **functional/prefer-immutable-types**: `"off"` = `'off'`

##### functional/prefer-property-signatures

> `readonly` **functional/prefer-property-signatures**: `1` \| `2`

##### functional/prefer-readonly-type

> `readonly` **functional/prefer-readonly-type**: `0` = `0`

##### functional/prefer-tacit

> `readonly` **functional/prefer-tacit**: `"off"` = `'off'`

##### functional/readonly-type

> `readonly` **functional/readonly-type**: readonly \[`"error"`, `"generic"`\]

##### functional/type-declaration-immutability

> `readonly` **functional/type-declaration-immutability**: `"off"` = `'off'`

#### Link
