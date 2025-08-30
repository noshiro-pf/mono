[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / utils/validation-error

# utils/validation-error

## Type Aliases

### ValidationError

> **ValidationError** = `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `string` \| `undefined`; `path`: readonly `string`[]; `typeName`: `string`; \}\>

Defined in: [src/utils/validation-error.mts:6](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L6)

Represents a validation error with structured information

---

### ValidationErrorWithMessage

> **ValidationErrorWithMessage** = `MergeIntersection`\<`StrictOmit`\<[`ValidationError`](#validationerror), `"message"`\> & `Readonly`\<\{ `message`: `string`; \}\>\>

Defined in: [src/utils/validation-error.mts:19](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L19)

## Functions

### createPrimitiveValidationError()

> **createPrimitiveValidationError**(`__namedParameters`): [`ValidationError`](#validationerror)

Defined in: [src/utils/validation-error.mts:82](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L82)

Creates a basic validation error for primitive type validation

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `typeName`: `string`; \}\>

#### Returns

[`ValidationError`](#validationerror)

---

### prependIndexToValidationErrors()

> **prependIndexToValidationErrors**(`errors`, `index`): readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

Defined in: [src/utils/validation-error.mts:73](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L73)

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

Defined in: [src/utils/validation-error.mts:61](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L61)

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

> **validationErrorsToMessages**(`errors`, `maxLengthToPrintActualValue`): readonly `string`[]

Defined in: [src/utils/validation-error.mts:52](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L52)

Converts an array of validation errors to an array of string messages
(for backward compatibility)

#### Parameters

##### errors

readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

##### maxLengthToPrintActualValue

`number` = `20`

#### Returns

readonly `string`[]

---

### validationErrorToMessage()

> **validationErrorToMessage**(`error`, `maxLengthToPrintActualValue`): `string`

Defined in: [src/utils/validation-error.mts:26](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L26)

Converts a validation error to a human-readable string message

#### Parameters

##### error

[`ValidationError`](#validationerror)

##### maxLengthToPrintActualValue

`number` = `20`

#### Returns

`string`
