[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/exec-async

# functions/exec-async

## Type Aliases

### ExecOptions

> **ExecOptions** = `childProcess.ExecOptions` & `ExecOptionsCustom`

Defined in: [src/functions/exec-async.mts:20](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L20)

***

### ExecResult

> **ExecResult**\<`T`\> = [`Result`](../node-global.md#result)\<`Readonly`\<\{ `stderr`: `T`; `stdout`: `T`; \}\>, `childProcess.ExecException`\>

Defined in: [src/functions/exec-async.mts:22](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L22)

#### Type Parameters

##### T

`T` *extends* `string` \| `Buffer`

## Functions

### $()

#### Call Signature

> **$**(`command`, `options?`): `Promise`\<[`ExecResult`](#execresult)\<`string`\>\>

Defined in: [src/functions/exec-async.mts:35](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L35)

Executes a shell command asynchronously.

##### Parameters

###### command

`string`

The command to execute.

###### options?

`Readonly`\<`ExecOptionsWithStringEncoding` & `Readonly`\<\{ `silent?`: `boolean`; \}\>\>

Optional configuration for command execution.

##### Returns

`Promise`\<[`ExecResult`](#execresult)\<`string`\>\>

A promise that resolves with the command result.

#### Call Signature

> **$**(`command`, `options`): `Promise`\<[`ExecResult`](#execresult)\<`Buffer`\<`ArrayBufferLike`\>\>\>

Defined in: [src/functions/exec-async.mts:41](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L41)

Executes a shell command asynchronously.

##### Parameters

###### command

`string`

The command to execute.

###### options

`ExecOptionsWithBufferEncoding`

Optional configuration for command execution.

##### Returns

`Promise`\<[`ExecResult`](#execresult)\<`Buffer`\<`ArrayBufferLike`\>\>\>

A promise that resolves with the command result.

#### Call Signature

> **$**\<`TOptions`\>(`command`, `options?`): `Promise`\<[`ExecResult`](#execresult)\<`TOptions` *extends* `Readonly`\<`ExecOptionsWithBufferEncoding` & `Readonly`\<\{ `silent?`: `boolean`; \}\>\> ? `Buffer`\<`ArrayBufferLike`\> : `string`\>\>

Defined in: [src/functions/exec-async.mts:47](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L47)

Executes a shell command asynchronously.

##### Type Parameters

###### TOptions

`TOptions` *extends* `Readonly`\<`ExecOptionsWithStringEncoding` & `Readonly`\<\{ `silent?`: `boolean`; \}\>\> \| `Readonly`\<`ExecOptionsWithBufferEncoding` & `Readonly`\<\{ `silent?`: `boolean`; \}\>\> \| `undefined` = `undefined`

##### Parameters

###### command

`string`

The command to execute.

###### options?

`TOptions`

Optional configuration for command execution.

##### Returns

`Promise`\<[`ExecResult`](#execresult)\<`TOptions` *extends* `Readonly`\<`ExecOptionsWithBufferEncoding` & `Readonly`\<\{ `silent?`: `boolean`; \}\>\> ? `Buffer`\<`ArrayBufferLike`\> : `string`\>\>

A promise that resolves with the command result.
