[**Documentation**](../README.md)

---

[Documentation](../README.md) / functions/exec-async

# functions/exec-async

## Type Aliases

### ExecResult

> **ExecResult** = `Readonly`\<\{ `stderr`: `string`; `stdout`: `string`; `type`: `"ok"`; \} \| \{ `exception`: `ExecException`; `type`: `"error"`; \}\>

Defined in: [src/functions/exec-async.mts:3](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L3)

## Functions

### $()

> **$**(`cmd`, `options`): `Promise`\<[`ExecResult`](#execresult)\>

Defined in: [src/functions/exec-async.mts:14](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L14)

Executes a shell command asynchronously.

#### Parameters

##### cmd

`string`

The command to execute.

##### options

`Readonly`\<\{ `silent?`: `boolean`; `timeout?`: `number`; \}\> = `{}`

Optional configuration for command execution.

#### Returns

`Promise`\<[`ExecResult`](#execresult)\>

A promise that resolves with the command result.
