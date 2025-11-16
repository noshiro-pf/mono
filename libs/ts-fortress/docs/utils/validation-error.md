[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / utils/validation-error

# utils/validation-error

## Type Aliases

### ValidationError

> **ValidationError** = `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>

Defined in: [src/utils/validation-error.mts:74](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L74)

Represents a validation error with structured information

***

### ValidationErrorDetails

> **ValidationErrorDetails** = `Readonly`\<\{ `kind`: `"custom"`; `message`: `string`; \} \| \{ `kind`: `"enum"`; `values`: readonly `unknown`[]; \} \| \{ `endExclusive`: `number`; `kind`: `"integer-range"`; `start`: `number`; \} \| \{ `actualLength`: `number`; `expectedLength`: `number`; `kind`: `"tuple-length"`; \} \| \{ `actualLength`: `number`; `expectedLength`: `number`; `kind`: `"array-length"`; \} \| \{ `actualLength`: `number`; `kind`: `"array-min-length"`; `minLength`: `number`; \} \| \{ `kind`: `"non-empty-array"`; \} \| \{ `key`: `string`; `kind`: `"missing-key"`; \} \| \{ `key`: `string`; `kind`: `"excess-key"`; \} \| \{ `kind`: `"intersection"`; `typeNames`: readonly `string`[]; \} \| \{ `kind`: `"union"`; `typeNames`: readonly `string`[]; \} \| \{ `entry`: `"key"` \| `"value"`; `expectedType`: `string`; `kind`: `"record-entry"`; \} \| \{ `entry`: `"key"` \| `"value"`; `expectedType`: `string`; `kind`: `"map-entry"`; \} \| \{ `expectedType`: `string`; `kind`: `"set-element"`; \} \| \{ `description`: `string`; `kind`: `"brand"`; \}\>

Defined in: [src/utils/validation-error.mts:3](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L3)

## Functions

### createPrimitiveValidationError()

> **createPrimitiveValidationError**(`__namedParameters`): [`ValidationError`](#validationerror)

Defined in: [src/utils/validation-error.mts:209](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L209)

Creates a basic validation error for primitive type validation

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `actualValue`: `unknown`; `details`: [`ValidationErrorDetails`](#validationerrordetails) \| `undefined`; `expectedType`: `string`; `typeName`: `string`; \}\>

#### Returns

[`ValidationError`](#validationerror)

***

### prependIndexToValidationErrors()

> **prependIndexToValidationErrors**(`errors`, `index`): readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

Defined in: [src/utils/validation-error.mts:200](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L200)

Prepends an array index to all validation errors

#### Parameters

##### errors

readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

##### index

`number`

#### Returns

readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

***

### prependPathToValidationErrors()

> **prependPathToValidationErrors**(`errors`, `pathSegment`): readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

Defined in: [src/utils/validation-error.mts:188](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L188)

Prepends a path segment to all validation errors

#### Parameters

##### errors

readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

##### pathSegment

`string`

#### Returns

readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

***

### validationErrorsToMessages()

> **validationErrorsToMessages**(`errors`, `maxLengthToPrintActualValue`): readonly `string`[]

Defined in: [src/utils/validation-error.mts:179](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L179)

Converts an array of validation errors to an array of string messages
(for backward compatibility)

#### Parameters

##### errors

readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]

##### maxLengthToPrintActualValue

`number` = `20`

#### Returns

readonly `string`[]

***

### validationErrorToMessage()

> **validationErrorToMessage**(`error`, `maxLengthToPrintActualValue`): `string`

Defined in: [src/utils/validation-error.mts:90](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/validation-error.mts#L90)

Converts a validation error to a human-readable string message

#### Parameters

##### error

[`ValidationError`](#validationerror)

##### maxLengthToPrintActualValue

`number` = `20`

#### Returns

`string`
