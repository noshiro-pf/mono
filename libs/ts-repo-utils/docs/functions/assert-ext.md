[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/assert-ext

# functions/assert-ext

## Type Aliases

### CheckExtConfig

> **CheckExtConfig** = `DeepReadonly`\<\{ `directories`: `object`[]; \}\>

Defined in: [src/functions/assert-ext.mts:7](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-ext.mts#L7)

Configuration for directory extension checking.

***

### CheckExtError

> **CheckExtError** = `Readonly`\<\{ `files`: readonly `string`[]; `message`: `string`; \}\>

Defined in: [src/functions/assert-ext.mts:27](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-ext.mts#L27)

## Variables

### assertExt()

> `const` **assertExt**: (`config`) => `Promise`\<`undefined`\>

Defined in: [src/functions/assert-ext.mts:84](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-ext.mts#L84)

Validates that all files in specified directories have the correct
extensions. Exits with code 1 if any files have incorrect extensions.

#### Parameters

##### config

Configuration specifying directories and expected extensions.

###### directories

readonly `object`[]

Array of directory paths and their expected extensions

#### Returns

`Promise`\<`undefined`\>

## Functions

### checkExt()

> **checkExt**(`config`): `Promise`\<[`Result`](../entry-point/README.md#result)\<`undefined`, `Readonly`\<\{ `files`: readonly `string`[]; `message`: `string`; \}\>\>\>

Defined in: [src/functions/assert-ext.mts:39](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-ext.mts#L39)

Validates that all files in specified directories have the correct
extensions.

#### Parameters

##### config

Configuration specifying directories and expected extensions.

###### directories

readonly `object`[]

Array of directory paths and their expected extensions

#### Returns

`Promise`\<[`Result`](../entry-point/README.md#result)\<`undefined`, `Readonly`\<\{ `files`: readonly `string`[]; `message`: `string`; \}\>\>\>

Result.ok when all files pass, otherwise Result.err with details.
