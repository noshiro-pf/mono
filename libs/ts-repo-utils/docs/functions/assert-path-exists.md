[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/assert-path-exists

# functions/assert-path-exists

## Functions

### assertPathExists()

> **assertPathExists**(`filePath`, `description`): `Promise`\<`void`\>

Defined in: [src/functions/assert-path-exists.mts:25](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-path-exists.mts#L25)

Validates that a path exists and exits with code 1 if it doesn't.

#### Parameters

##### filePath

`string`

The path to validate.

##### description

`string` = `'Path'`

Description for error message (defaults to 'Path').

#### Returns

`Promise`\<`void`\>

***

### pathExists()

> **pathExists**(`filePath`): `Promise`\<`boolean`\>

Defined in: [src/functions/assert-path-exists.mts:9](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/assert-path-exists.mts#L9)

Checks if a file or directory exists.

#### Parameters

##### filePath

`string`

The path to check.

#### Returns

`Promise`\<`boolean`\>

True if the path exists.
