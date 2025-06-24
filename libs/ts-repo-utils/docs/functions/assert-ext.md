[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/assert-ext

# functions/assert-ext

## Type Aliases

### CheckExtConfig

> **CheckExtConfig** = `DeepReadonly`\<\{ `directories`: `object`[]; \}\>

Defined in: [src/functions/assert-ext.mts:8](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-ext.mts#L8)

Configuration for directory extension checking.

## Functions

### assertExt()

> **assertExt**(`config`): `Promise`\<`void`\>

Defined in: [src/functions/assert-ext.mts:27](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-ext.mts#L27)

Validates that all files in specified directories have the correct extensions.
Exits with code 1 if any files have incorrect extensions.

#### Parameters

##### config

Configuration specifying directories and expected extensions.

###### directories

readonly `object`[]

Array of directory paths and their expected extensions

#### Returns

`Promise`\<`void`\>
