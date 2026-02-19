[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/combine/combine

# core/combine/combine

## Variables

### combineLatest()

> `const` **combineLatest**: \<`OS`\>(`parents`) => [`CombineObservableRefined`](../types/observable-family.md#combineobservablerefined)\<`OS`\> = `combine`

Defined in: [core/combine/combine.mts:86](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/combine/combine.mts#L86)

Alias for `combine()`.

Combines multiple observables into a single observable that emits an array of their latest values.
Emits whenever any of the source observables emit, but only after all sources have emitted at least once.

#### Type Parameters

##### OS

`OS` *extends* readonly \[[`Observable`](../types/observable.md#observable)\<`unknown`\>, [`Observable`](../types/observable.md#observable)\<`unknown`\>\]

Tuple type of source observables

#### Parameters

##### parents

`OS`

Array of observables to combine

#### Returns

[`CombineObservableRefined`](../types/observable-family.md#combineobservablerefined)\<`OS`\>

A combined observable emitting tuples of values

#### Example

```ts
//  Timeline:
//
//  name$     "Alice"                 "Bob"
//  age$                25                        30
//  user$               ["Alice",25]  ["Bob",25]  ["Bob",30]
//
//  Explanation:
//  - combine waits for all sources to emit at least once
//  - Then emits the latest value from all sources whenever any source emits
//  - Always emits an array with the latest values from each source

const name$ = source<string>();

const age$ = source<number>();

const user$ = combine([name$, age$]);

const mut_history: (readonly [string, number])[] = [];

user$.subscribe(([name_, age]) => {
  mut_history.push([name_, age]);
});

name$.next('Alice'); // nothing logged (age$ hasn't emitted yet)

assert.deepStrictEqual(mut_history, []);

age$.next(25); // logs: { name: 'Alice', age: 25 }

assert.deepStrictEqual(mut_history, [['Alice', 25]]);

name$.next('Bob'); // logs: { name: 'Bob', age: 25 }

assert.deepStrictEqual(mut_history, [
  ['Alice', 25],
  ['Bob', 25],
]);

age$.next(30); // logs: { name: 'Bob', age: 30 }

assert.deepStrictEqual(mut_history, [
  ['Alice', 25],
  ['Bob', 25],
  ['Bob', 30],
]);
```

#### See

combine

## Functions

### combine()

> **combine**\<`OS`\>(`parents`): [`CombineObservableRefined`](../types/observable-family.md#combineobservablerefined)\<`OS`\>

Defined in: [core/combine/combine.mts:74](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/combine/combine.mts#L74)

Combines multiple observables into a single observable that emits an array of their latest values.
Emits whenever any of the source observables emit, but only after all sources have emitted at least once.

#### Type Parameters

##### OS

`OS` *extends* readonly \[[`Observable`](../types/observable.md#observable)\<`unknown`\>, [`Observable`](../types/observable.md#observable)\<`unknown`\>\]

Tuple type of source observables

#### Parameters

##### parents

`OS`

Array of observables to combine

#### Returns

[`CombineObservableRefined`](../types/observable-family.md#combineobservablerefined)\<`OS`\>

A combined observable emitting tuples of values

#### Example

```ts
//  Timeline:
//
//  name$     "Alice"                 "Bob"
//  age$                25                        30
//  user$               ["Alice",25]  ["Bob",25]  ["Bob",30]
//
//  Explanation:
//  - combine waits for all sources to emit at least once
//  - Then emits the latest value from all sources whenever any source emits
//  - Always emits an array with the latest values from each source

const name$ = source<string>();

const age$ = source<number>();

const user$ = combine([name$, age$]);

const mut_history: (readonly [string, number])[] = [];

user$.subscribe(([name_, age]) => {
  mut_history.push([name_, age]);
});

name$.next('Alice'); // nothing logged (age$ hasn't emitted yet)

assert.deepStrictEqual(mut_history, []);

age$.next(25); // logs: { name: 'Alice', age: 25 }

assert.deepStrictEqual(mut_history, [['Alice', 25]]);

name$.next('Bob'); // logs: { name: 'Bob', age: 25 }

assert.deepStrictEqual(mut_history, [
  ['Alice', 25],
  ['Bob', 25],
]);

age$.next(30); // logs: { name: 'Bob', age: 30 }

assert.deepStrictEqual(mut_history, [
  ['Alice', 25],
  ['Bob', 25],
  ['Bob', 30],
]);
```
