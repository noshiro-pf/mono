[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/exec-async

# functions/exec-async

## Type Aliases

### ExecOptions

> **ExecOptions** = `childProcess.ExecOptions` & `ExecOptionsCustom`

Defined in: [src/functions/exec-async.mts:8](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L8)

***

### ExecResult\<T\>

> **ExecResult**\<`T`\> = `Result`\<`Readonly`\<\{ `stderr`: `T`; `stdout`: `T`; \}\>, `childProcess.ExecException`\>

Defined in: [src/functions/exec-async.mts:10](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L10)

#### Type Parameters

##### T

`T` *extends* `string` \| `Buffer`

## Functions

### $()

#### Call Signature

> **$**(`command`, `options?`): `Promise`\<[`ExecResult`](#execresult)\<`string`\>\>

Defined in: [src/functions/exec-async.mts:22](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L22)

Executes a shell command asynchronously.

##### Parameters

###### command

`string`

The command to execute.

###### options?

`Readonly`\<\{ `silent?`: `boolean`; \}\>

Optional configuration for command execution.

##### Returns

`Promise`\<[`ExecResult`](#execresult)\<`string`\>\>

A promise that resolves with the command result.

#### Call Signature

> **$**(`command`, `options`): `Promise`\<[`ExecResult`](#execresult)\<`Buffer`\<`ArrayBufferLike`\>\>\>

Defined in: [src/functions/exec-async.mts:27](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L27)

Executes a shell command asynchronously.

##### Parameters

###### command

`string`

The command to execute.

###### options

`Readonly`\<`object` & [`ExecOptions`](#execoptions)\>

Optional configuration for command execution.

##### Returns

`Promise`\<[`ExecResult`](#execresult)\<`Buffer`\<`ArrayBufferLike`\>\>\>

A promise that resolves with the command result.

#### Call Signature

> **$**(`command`, `options`): `Promise`\<[`ExecResult`](#execresult)\<`string`\>\>

Defined in: [src/functions/exec-async.mts:33](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L33)

Executes a shell command asynchronously.

##### Parameters

###### command

`string`

The command to execute.

###### options

`Readonly`\<`object` & [`ExecOptions`](#execoptions)\>

Optional configuration for command execution.

##### Returns

`Promise`\<[`ExecResult`](#execresult)\<`string`\>\>

A promise that resolves with the command result.
