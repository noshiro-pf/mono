[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/with-buffered-from

# core/operators/with-buffered-from

## Variables

### withBuffered()

> `const` **withBuffered**: \<`A`, `B`\>(`observable`) => [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`A`, readonly `B`[]\]\> = `withBufferedFrom`

Defined in: [core/operators/with-buffered-from.mts:74](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/with-buffered-from.mts#L74)

Buffers values from the source observable and emits them along with the parent value
when the parent emits. The buffer is cleared after each emission.

#### Type Parameters

##### A

`A`

The type of values from the parent observable

##### B

`B`

The type of values from the source observable

#### Parameters

##### observable

[`Observable`](../types/observable.md#observable)\<`B`\>

The observable whose values will be buffered

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`A`, readonly `B`[]\]\>

An operator that emits tuples of [parentValue, bufferedValues]

#### Example

```ts
//  Timeline:
//
//  data$       d1    d2    d3    d4    d5    d6    d7    d8
//  trigger$                T1                T2                T3
//  result$                 [T1,[d1,d2,d3]]   [T2,[d4,d5,d6]]   [T3,[d7,d8]]
//
//  Explanation:
//  - withBufferedFrom collects values from the source observable
//  - When the trigger emits, it emits a tuple of [triggerValue, bufferedValues]
//  - Buffer is cleared after each emission
//  - Useful for batching data collection triggered by events

const data$ = source<string>();

const trigger$ = source<number>();

const result$ = trigger$.pipe(withBufferedFrom(data$));

const mut_history: (readonly [number, readonly string[]])[] = [];

result$.subscribe(([triggerValue, bufferedData]) => {
  mut_history.push([triggerValue, bufferedData]);
});

data$.next('a');

data$.next('b');

trigger$.next(1);

assert.deepStrictEqual(mut_history, [[1, ['a', 'b']]]);

data$.next('c');

trigger$.next(2);

assert.deepStrictEqual(mut_history, [
  [1, ['a', 'b']],
  [2, ['c']],
]);
```

## Functions

### withBufferedFrom()

> **withBufferedFrom**\<`A`, `B`\>(`observable`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`A`, readonly `B`[]\]\>

Defined in: [core/operators/with-buffered-from.mts:64](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/with-buffered-from.mts#L64)

Buffers values from the source observable and emits them along with the parent value
when the parent emits. The buffer is cleared after each emission.

#### Type Parameters

##### A

`A`

The type of values from the parent observable

##### B

`B`

The type of values from the source observable

#### Parameters

##### observable

[`Observable`](../types/observable.md#observable)\<`B`\>

The observable whose values will be buffered

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, readonly \[`A`, readonly `B`[]\]\>

An operator that emits tuples of [parentValue, bufferedValues]

#### Example

```ts
//  Timeline:
//
//  data$       d1    d2    d3    d4    d5    d6    d7    d8
//  trigger$                T1                T2                T3
//  result$                 [T1,[d1,d2,d3]]   [T2,[d4,d5,d6]]   [T3,[d7,d8]]
//
//  Explanation:
//  - withBufferedFrom collects values from the source observable
//  - When the trigger emits, it emits a tuple of [triggerValue, bufferedValues]
//  - Buffer is cleared after each emission
//  - Useful for batching data collection triggered by events

const data$ = source<string>();

const trigger$ = source<number>();

const result$ = trigger$.pipe(withBufferedFrom(data$));

const mut_history: (readonly [number, readonly string[]])[] = [];

result$.subscribe(([triggerValue, bufferedData]) => {
  mut_history.push([triggerValue, bufferedData]);
});

data$.next('a');

data$.next('b');

trigger$.next(1);

assert.deepStrictEqual(mut_history, [[1, ['a', 'b']]]);

data$.next('c');

trigger$.next(2);

assert.deepStrictEqual(mut_history, [
  [1, ['a', 'b']],
  [2, ['c']],
]);
```
