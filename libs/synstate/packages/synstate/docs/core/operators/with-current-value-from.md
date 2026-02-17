[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/with-current-value-from

# core/operators/with-current-value-from

## Variables

### withLatestFrom()

> `const` **withLatestFrom**: \<`A`, `B`\>(`observable`) => [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `B`\]\> = `withCurrentValueFrom`

Defined in: [core/operators/with-current-value-from.mts:18](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/with-current-value-from.mts#L18)

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### observable

[`Observable`](../types/observable.md#observable)\<`B`\>

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `B`\]\>

## Functions

### withCurrentValueFrom()

> **withCurrentValueFrom**\<`A`, `B`\>(`observable`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `B`\]\>

Defined in: [core/operators/with-current-value-from.mts:12](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/with-current-value-from.mts#L12)

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### observable

[`Observable`](../types/observable.md#observable)\<`B`\>

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `B`\]\>
