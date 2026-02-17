[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/combine/combine

# core/combine/combine

## Variables

### combineLatest()

> `const` **combineLatest**: \<`OS`\>(`parents`) => [`CombineObservableRefined`](../types/observable-family.md#combineobservablerefined)\<`OS`\> = `combine`

Defined in: [core/combine/combine.mts:56](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/combine/combine.mts#L56)

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
const name$ = source<string>();

const age$ = source<number>();

const user$ = combine([name$, age$]);

user$.subscribe(([name_, age]) => {
  console.log({ name: name_, age });
});

name$.next('Alice');

age$.next(25); // logs: { name: 'Alice', age: 25 }

name$.next('Bob'); // logs: { name: 'Bob', age: 25 }
```

#### See

combine

## Functions

### combine()

> **combine**\<`OS`\>(`parents`): [`CombineObservableRefined`](../types/observable-family.md#combineobservablerefined)\<`OS`\>

Defined in: [core/combine/combine.mts:44](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/combine/combine.mts#L44)

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
const name$ = source<string>();

const age$ = source<number>();

const user$ = combine([name$, age$]);

user$.subscribe(([name_, age]) => {
  console.log({ name: name_, age });
});

name$.next('Alice');

age$.next(25); // logs: { name: 'Alice', age: 25 }

name$.next('Bob'); // logs: { name: 'Bob', age: 25 }
```
