[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/filter

# core/operators/filter

## Functions

### filter()

#### Call Signature

> **filter**\<`A`, `B`\>(`predicate`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `B`\>

Defined in: [core/operators/filter.mts:68](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/filter.mts#L68)

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
//  Timeline:
//
//  num$          1     2     3     4     5     6
//  even$               2           4           6
//
//  Explanation:
//  - filter passes through only values that satisfy the predicate
//  - Only even numbers (2, 4, 6) are emitted

const num$ = source<number>();

const even$ = num$.pipe(filter((x) => x % 2 === 0));

const mut_history: number[] = [];

even$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [2]);

num$.next(3); // nothing logged

num$.next(4); // logs: 4

assert.deepStrictEqual(mut_history, [2, 4]);

num$.next(5);

num$.next(6);

assert.deepStrictEqual(mut_history, [2, 4, 6]);
```

#### Call Signature

> **filter**\<`A`\>(`predicate`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/filter.mts:72](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/filter.mts#L72)

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
//  Timeline:
//
//  num$          1     2     3     4     5     6
//  even$               2           4           6
//
//  Explanation:
//  - filter passes through only values that satisfy the predicate
//  - Only even numbers (2, 4, 6) are emitted

const num$ = source<number>();

const even$ = num$.pipe(filter((x) => x % 2 === 0));

const mut_history: number[] = [];

even$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // nothing logged

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [2]);

num$.next(3); // nothing logged

num$.next(4); // logs: 4

assert.deepStrictEqual(mut_history, [2, 4]);

num$.next(5);

num$.next(6);

assert.deepStrictEqual(mut_history, [2, 4, 6]);
```
