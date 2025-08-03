[**ts-repo-utils**](../README.md)

---

[ts-repo-utils](../README.md) / functions/exec-async

# functions/exec-async

## Functions

### $()

#### Call Signature

> **$**(`command`, `options?`): `Promise`\<`ExecResult`\<`string`\>\>

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

`Promise`\<`ExecResult`\<`string`\>\>

A promise that resolves with the command result.

#### Call Signature

> **$**(`command`, `options`): `Promise`\<`ExecResult`\<`Buffer`\<`ArrayBufferLike`\>\>\>

Defined in: [src/functions/exec-async.mts:31](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L31)

Executes a shell command asynchronously.

##### Parameters

###### command

`string`

The command to execute.

###### options

`Readonly`\<`object` & `ExecOptions`\>

Optional configuration for command execution.

##### Returns

`Promise`\<`ExecResult`\<`Buffer`\<`ArrayBufferLike`\>\>\>

A promise that resolves with the command result.

#### Call Signature

> **$**(`command`, `options`): `Promise`\<`ExecResult`\<`string`\>\>

Defined in: [src/functions/exec-async.mts:36](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/exec-async.mts#L36)

Executes a shell command asynchronously.

##### Parameters

###### command

`string`

The command to execute.

###### options

`Readonly`\<`object` & `ExecOptions`\>

Optional configuration for command execution.

##### Returns

`Promise`\<`ExecResult`\<`string`\>\>

A promise that resolves with the command result.
