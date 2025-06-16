[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/assert-ext

# functions/assert-ext

## Type Aliases

### CheckExtConfig

> **CheckExtConfig** = `DeepReadonly`\<\{ `directories`: `object`[]; \}\>

Defined in: [src/functions/assert-ext.mts:7](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-ext.mts#L7)

Configuration for directory extension checking.

## Functions

### assertExt()

> **assertExt**(`config`): `Promise`\<`void`\>

Defined in: [src/functions/assert-ext.mts:24](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-ext.mts#L24)

Validates that all files in specified directories have the correct extensions.

#### Parameters

##### config

Configuration specifying directories and expected extensions.

###### directories

readonly `object`[]

Array of directory paths and their expected extensions

#### Returns

`Promise`\<`void`\>

#### Throws

Error with details of all incorrect files found.
