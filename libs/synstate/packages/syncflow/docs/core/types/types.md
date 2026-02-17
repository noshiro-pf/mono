[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/types/types

# core/types/types

## Type Aliases

### NonEmptyUnknownList

> **NonEmptyUnknownList** = readonly \[`unknown`, `...unknown[]`\]

Defined in: [core/types/types.mts:7](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/types/types.mts#L7)

***

### Subscribable

> **Subscribable**\<`A`\> = `Readonly`\<\{ `subscribe`: (`onNext`, `onError?`, `onComplete?`) => [`Subscription`](#subscription); \}\>

Defined in: [core/types/types.mts:18](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/types/types.mts#L18)

#### Type Parameters

##### A

`A`

***

### Subscriber

> **Subscriber**\<`A`\> = `Readonly`\<\{ `onComplete`: () => `void`; `onNext`: (`v`) => `void`; \}\>

Defined in: [core/types/types.mts:9](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/types/types.mts#L9)

#### Type Parameters

##### A

`A`

***

### Subscription

> **Subscription** = `Readonly`\<\{ `unsubscribe`: () => `void`; \}\>

Defined in: [core/types/types.mts:14](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/types/types.mts#L14)

***

### TupleToQueueTuple

> **TupleToQueueTuple**\<`T`\> = `Readonly`\<`{ [P in keyof T]: Queue<T[P]> }`\>

Defined in: [core/types/types.mts:3](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/types/types.mts#L3)

#### Type Parameters

##### T

`T` *extends* readonly `unknown`[]
