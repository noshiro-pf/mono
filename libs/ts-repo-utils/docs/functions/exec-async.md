[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/exec-async

# functions/exec-async

## Functions

### $()

> **$**(`cmd`, `options`): `Promise`\<`Result`\<`Readonly`\<\{ `stderr`: `string`; `stdout`: `string`; \}\>, `ExecException`\>\>

Defined in: [src/functions/exec-async.mts:10](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L10)

Executes a shell command asynchronously.

#### Parameters

##### cmd

`string`

The command to execute.

##### options

`Readonly`\<\{ `silent?`: `boolean`; `timeout?`: `number`; \}\> = `{}`

Optional configuration for command execution.

#### Returns

`Promise`\<`Result`\<`Readonly`\<\{ `stderr`: `string`; `stdout`: `string`; \}\>, `ExecException`\>\>

A promise that resolves with the command result.
