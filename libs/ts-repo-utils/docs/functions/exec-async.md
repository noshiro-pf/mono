[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/exec-async

# functions/exec-async

## Type Aliases

### ExecOptions

> **ExecOptions** = `DeepReadonly`\<`ExecOptions_` & `ExecOptionsCustom`\>

Defined in: [src/functions/exec-async.mts:12](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L12)

***

### ExecResult\<T\>

> **ExecResult**\<`T`\> = `Result`\<`Readonly`\<\{ `stderr`: `T`; `stdout`: `T`; \}\>, `ExecException`\>

Defined in: [src/functions/exec-async.mts:14](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L14)

#### Type Parameters

##### T

`T` *extends* `string` \| `Buffer`

## Functions

### $()

#### Call Signature

> **$**(`command`, `options?`): `Promise`\<[`ExecResult`](#execresult)\<`string`\>\>

Defined in: [src/functions/exec-async.mts:26](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L26)

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

Defined in: [src/functions/exec-async.mts:31](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L31)

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

Defined in: [src/functions/exec-async.mts:36](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L36)

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
