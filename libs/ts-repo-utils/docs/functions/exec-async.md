[**ts-repo-utils**](../README.md)

---

[ts-repo-utils](../README.md) / functions/exec-async

# functions/exec-async

## Type Aliases

### ExecOptions

> **ExecOptions** = `childProcess.ExecOptions` & `ExecOptionsCustom`

Defined in: [src/functions/exec-async.mts:8](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L8)

---

### ExecResult

> **ExecResult**\<`T`\> = [`Result`](../entry-point/README.md#result)\<`Readonly`\<\{ `stderr`: `T`; `stdout`: `T`; \}\>, `childProcess.ExecException`\>

Defined in: [src/functions/exec-async.mts:10](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L10)

#### Type Parameters

##### T

`T` _extends_ `string` \| `Buffer`

## Functions

### $()

#### Call Signature

> **$**(`command`, `options?`): `Promise`\<[`ExecResult`](#execresult)\<`string`\>\>

Defined in: [src/functions/exec-async.mts:23](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L23)

Executes a shell command asynchronously.

##### Parameters

###### command

`string`

The command to execute.

###### options?

Optional configuration for command execution.

`Readonly`\<\{ `silent?`: `boolean`; \}\> | `Readonly`\<`object` & `ExecOptions` & `Readonly`\<\{ `silent?`: `boolean`; \}\>\>

##### Returns

`Promise`\<[`ExecResult`](#execresult)\<`string`\>\>

A promise that resolves with the command result.

#### Call Signature

> **$**(`command`, `options?`): `Promise`\<[`ExecResult`](#execresult)\<`Buffer`\<`ArrayBufferLike`\>\>\>

Defined in: [src/functions/exec-async.mts:31](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L31)

Executes a shell command asynchronously.

##### Parameters

###### command

`string`

The command to execute.

###### options?

`Readonly`\<`object` & `ExecOptions` & `Readonly`\<\{ `silent?`: `boolean`; \}\>\>

Optional configuration for command execution.

##### Returns

`Promise`\<[`ExecResult`](#execresult)\<`Buffer`\<`ArrayBufferLike`\>\>\>

A promise that resolves with the command result.
