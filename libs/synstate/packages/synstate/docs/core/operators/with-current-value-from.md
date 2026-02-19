[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/with-current-value-from

# core/operators/with-current-value-from

## Variables

### withLatestFrom()

> `const` **withLatestFrom**: \<`A`, `B`\>(`observable`) => [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `B`\]\> = `withCurrentValueFrom`

Defined in: [core/operators/with-current-value-from.mts:73](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/with-current-value-from.mts#L73)

Samples the current value from another observable each time the source emits.
Emits a tuple of [sourceValue, sampledValue].

#### Type Parameters

##### A

`A`

The type of values from the source observable

##### B

`B`

The type of values from the sampled observable

#### Parameters

##### observable

[`Observable`](../types/observable.md#observable)\<`B`\>

The observable to sample from

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `B`\]\>

An operator that emits tuples of source and sampled values

#### Example

```ts
//  Timeline:
//
//  name$     "Alice"           "Bob"               "Charlie"
//  age$                25              30      35              40
//  result$             ["Alice",25]  ["Bob",30]  ["Bob",35]  ["Charlie",40]
//
//  Explanation:
//  - withCurrentValueFrom samples the current value from another observable
//  - Emits a tuple [sourceValue, sampledValue] each time the source emits
//  - Does not emit until both observables have emitted at least once
//  - Similar to combine, but only emits when the source (not the sampled) emits

const name$ = source<string>();

const age$ = source<number>();

const result$ = name$.pipe(withCurrentValueFrom(age$));

const mut_history: (readonly [string, number])[] = [];

result$.subscribe(([name_, currentAge]) => {
  mut_history.push([name_, currentAge]);
});

name$.next('Alice'); // nothing logged (age$ hasn't emitted)

assert.deepStrictEqual(mut_history, []);

age$.next(25);

name$.next('Bob'); // logs: Bob is 25 years old

assert.deepStrictEqual(mut_history, [['Bob', 25]]);

age$.next(30);

name$.next('Charlie'); // logs: Charlie is 30 years old

assert.deepStrictEqual(mut_history, [
  ['Bob', 25],
  ['Charlie', 30],
]);
```

## Functions

### withCurrentValueFrom()

> **withCurrentValueFrom**\<`A`, `B`\>(`observable`): [`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `B`\]\>

Defined in: [core/operators/with-current-value-from.mts:67](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/with-current-value-from.mts#L67)

Samples the current value from another observable each time the source emits.
Emits a tuple of [sourceValue, sampledValue].

#### Type Parameters

##### A

`A`

The type of values from the source observable

##### B

`B`

The type of values from the sampled observable

#### Parameters

##### observable

[`Observable`](../types/observable.md#observable)\<`B`\>

The observable to sample from

#### Returns

[`DropInitialValueOperator`](../types/observable.md#dropinitialvalueoperator)\<`A`, readonly \[`A`, `B`\]\>

An operator that emits tuples of source and sampled values

#### Example

```ts
//  Timeline:
//
//  name$     "Alice"           "Bob"               "Charlie"
//  age$                25              30      35              40
//  result$             ["Alice",25]  ["Bob",30]  ["Bob",35]  ["Charlie",40]
//
//  Explanation:
//  - withCurrentValueFrom samples the current value from another observable
//  - Emits a tuple [sourceValue, sampledValue] each time the source emits
//  - Does not emit until both observables have emitted at least once
//  - Similar to combine, but only emits when the source (not the sampled) emits

const name$ = source<string>();

const age$ = source<number>();

const result$ = name$.pipe(withCurrentValueFrom(age$));

const mut_history: (readonly [string, number])[] = [];

result$.subscribe(([name_, currentAge]) => {
  mut_history.push([name_, currentAge]);
});

name$.next('Alice'); // nothing logged (age$ hasn't emitted)

assert.deepStrictEqual(mut_history, []);

age$.next(25);

name$.next('Bob'); // logs: Bob is 25 years old

assert.deepStrictEqual(mut_history, [['Bob', 25]]);

age$.next(30);

name$.next('Charlie'); // logs: Charlie is 30 years old

assert.deepStrictEqual(mut_history, [
  ['Bob', 25],
  ['Charlie', 30],
]);
```
