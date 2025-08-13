[**ts-fortress**](README.md)

---

[ts-fortress](README.md) / validation-error

# validation-error

## Type Aliases

### ValidationError

> **ValidationError** = `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `string` \| `undefined`; `path`: readonly `string`[]; `typeName`: `string`; \}\>

Defined in: [validation-error.mts:4](https://github.com/noshiro-pf/ts-fortress/blob/main/src/validation-error.mts#L4)

Represents a validation error with structured information

---

### ValidationErrorWithMessage

> **ValidationErrorWithMessage** = `MergeIntersection`\<`StrictOmit`\<[`ValidationError`](#validationerror), `"message"`\> & `Readonly`\<\{ `message`: `string`; \}\>\>

Defined in: [validation-error.mts:17](https://github.com/noshiro-pf/ts-fortress/blob/main/src/validation-error.mts#L17)

## Functions

### createPrimitiveValidationError()

> **createPrimitiveValidationError**(`__namedParameters`): [`ValidationError`](#validationerror)

Defined in: [validation-error.mts:67](https://github.com/noshiro-pf/ts-fortress/blob/main/src/validation-error.mts#L67)

Creates a basic validation error for primitive type validation

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `typeName`: `string`; \}\>

#### Returns

[`ValidationError`](#validationerror)

---

### prependIndexToValidationErrors()

> **prependIndexToValidationErrors**(`errors`, `index`): readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

Defined in: [validation-error.mts:58](https://github.com/noshiro-pf/ts-fortress/blob/main/src/validation-error.mts#L58)

Prepends an array index to all validation errors

#### Parameters

##### errors

readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

##### index

`number`

#### Returns

readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

---

### prependPathToValidationErrors()

> **prependPathToValidationErrors**(`errors`, `pathSegment`): readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

Defined in: [validation-error.mts:46](https://github.com/noshiro-pf/ts-fortress/blob/main/src/validation-error.mts#L46)

Prepends a path segment to all validation errors

#### Parameters

##### errors

readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

##### pathSegment

`string`

#### Returns

readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

---

### validationErrorsToMessages()

> **validationErrorsToMessages**(`errors`): readonly `string`[]

Defined in: [validation-error.mts:39](https://github.com/noshiro-pf/ts-fortress/blob/main/src/validation-error.mts#L39)

Converts an array of validation errors to an array of string messages
(for backward compatibility)

#### Parameters

##### errors

readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

#### Returns

readonly `string`[]

---

### validationErrorToMessage()

> **validationErrorToMessage**(`error`): `string`

Defined in: [validation-error.mts:24](https://github.com/noshiro-pf/ts-fortress/blob/main/src/validation-error.mts#L24)

Converts a validation error to a human-readable string message

#### Parameters

##### error

[`ValidationError`](#validationerror)

#### Returns

`string`
