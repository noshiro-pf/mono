[**synstate**](../../../README.md)

***

[synstate](../../../README.md) / core/predefined/operators/pluck

# core/predefined/operators/pluck

## Variables

### getKey()

> `const` **getKey**: \<`A`, `K`\>(`key`) => [`KeepInitialValueOperator`](../../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\[`K`\]\> = `pluck`

Defined in: [core/predefined/operators/pluck.mts:12](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/predefined/operators/pluck.mts#L12)

Alias for `pluck`.

#### Type Parameters

##### A

`A`

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

#### Returns

[`KeepInitialValueOperator`](../../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\[`K`\]\>

#### See

pluck

## Functions

### pluck()

> **pluck**\<`A`, `K`\>(`key`): [`KeepInitialValueOperator`](../../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\[`K`\]\>

Defined in: [core/predefined/operators/pluck.mts:4](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/predefined/operators/pluck.mts#L4)

#### Type Parameters

##### A

`A`

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

#### Returns

[`KeepInitialValueOperator`](../../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\[`K`\]\>
