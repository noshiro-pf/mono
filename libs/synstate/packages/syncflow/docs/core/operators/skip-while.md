[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/operators/skip-while

# core/operators/skip-while

## Functions

### skip()

> **skip**\<`A`\>(`n`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/skip-while.mts:25](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/skip-while.mts#L25)

#### Type Parameters

##### A

`A`

#### Parameters

##### n

`PositiveSafeIntWithSmallInt`

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

***

### skipWhile()

> **skipWhile**\<`A`\>(`predicate`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/skip-while.mts:17](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/operators/skip-while.mts#L17)

#### Type Parameters

##### A

`A`

#### Parameters

##### predicate

(`value`, `index`) => `boolean`

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>
