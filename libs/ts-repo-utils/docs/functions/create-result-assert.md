[**ts-repo-utils**](../README.md)

***

[ts-repo-utils](../README.md) / functions/create-result-assert

# functions/create-result-assert

## Type Aliases

### CreateResultAssertOptions

> **CreateResultAssertOptions**\<`Config`, `Ok`, `Err`\> = `Readonly`\<\{ `exitCode?`: `number`; `onError?`: (`error`, `config`) => `void` \| `Promise`\<`void`\>; `onSuccess?`: (`value`, `config`) => `void` \| `Promise`\<`void`\>; `run`: `ResultProducer`\<`Config`, `Ok`, `Err`\>; \}\>

Defined in: [src/functions/create-result-assert.mts:8](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/create-result-assert.mts#L8)

#### Type Parameters

##### Config

`Config`

##### Ok

`Ok`

##### Err

`Err`

## Functions

### createResultAssert()

> **createResultAssert**\<`Config`, `Ok`, `Err`\>(`__namedParameters`): (`config`) => `Promise`\<`Ok`\>

Defined in: [src/functions/create-result-assert.mts:21](https://github.com/noshiro-pf/ts-repo-utils/blob/main/src/functions/create-result-assert.mts#L21)

Converts a function that returns a Result into an assert-style variant that
exits the process when the Result is Err. This is useful for building CLI
commands that should stop execution on failure but remain composable when a
Result is preferred.

#### Type Parameters

##### Config

`Config`

##### Ok

`Ok`

##### Err

`Err`

#### Parameters

##### \_\_namedParameters

[`CreateResultAssertOptions`](#createresultassertoptions)\<`Config`, `Ok`, `Err`\>

#### Returns

> (`config`): `Promise`\<`Ok`\>

##### Parameters

###### config

`Config`

##### Returns

`Promise`\<`Ok`\>
