[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/filter

# core/operators/filter

## Functions

### filter()

#### Call Signature

> **filter**\<`A`, `B`\>(`predicate`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/filter.mts:43](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/filter.mts#L43)

Filters values emitted by the source observable based on a predicate function.
Only values that satisfy the predicate will be emitted by the resulting observable.

##### Type Parameters

###### A

`A`

The type of values from the source

###### B

`B`

The narrowed type when using type guard

##### Parameters

###### predicate

(`value`, `index`) => `value is B`

A function that tests each value (receives value and index)

##### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `B`\>

An operator that filters the observable

##### Example

```ts
const num$ = source<number>();

const even$ = num$.pipe(filter((x) => x % 2 === 0));

even$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 2
```

#### Call Signature

> **filter**\<`A`\>(`predicate`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/filter.mts:47](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/filter.mts#L47)

Filters values emitted by the source observable based on a predicate function.
Only values that satisfy the predicate will be emitted by the resulting observable.

##### Type Parameters

###### A

`A`

The type of values from the source

##### Parameters

###### predicate

(`value`, `index`) => `boolean`

A function that tests each value (receives value and index)

##### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

An operator that filters the observable

##### Example

```ts
const num$ = source<number>();

const even$ = num$.pipe(filter((x) => x % 2 === 0));

even$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 2
```
