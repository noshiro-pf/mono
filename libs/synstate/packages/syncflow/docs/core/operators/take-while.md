[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/operators/take-while

# core/operators/take-while

## Functions

### take()

> **take**\<`A`\>(`n`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/take-while.mts:28](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/take-while.mts#L28)

#### Type Parameters

##### A

`A`

#### Parameters

##### n

`PositiveSafeIntWithSmallInt`

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

***

### takeWhile()

> **takeWhile**\<`A`\>(`predicate`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/take-while.mts:20](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/take-while.mts#L20)

#### Type Parameters

##### A

`A`

#### Parameters

##### predicate

(`value`, `index`) => `boolean`

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>
