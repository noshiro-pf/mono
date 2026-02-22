[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/create/source

# core/create/source

## Variables

### subject()

> `const` **subject**: \{\<`A`\>(`initialValue`): [`InitializedSourceObservable`](../types/observable-family.md#initializedsourceobservable)\<`A`\>; \<`A`\>(): [`SourceObservable`](../types/observable-family.md#sourceobservable)\<`A`\>; \} = `source`

Defined in: [core/create/source.mts:59](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/source.mts#L59)

Alias for `source`. Creates a new Observable source.

#### Call Signature

> \<`A`\>(`initialValue`): [`InitializedSourceObservable`](../types/observable-family.md#initializedsourceobservable)\<`A`\>

Creates a new Observable source that can manually emit values.
This is the primary way to create root observables that start reactive chains.

##### Type Parameters

###### A

`A`

The type of values emitted by the source

##### Parameters

###### initialValue

`A`

##### Returns

[`InitializedSourceObservable`](../types/observable-family.md#initializedsourceobservable)\<`A`\>

A SourceObservable that can emit values via `.next()` method

##### Example

```ts
//  Timeline:
//
//  count$    1     2     3     ...
//
//  Explanation:
//  - source creates a new observable that you can manually emit values to
//  - Use .next() to emit values
//  - Foundation for building custom observables

const count$ = source<number>();

const mut_history: number[] = [];

count$.subscribe((value) => {
  mut_history.push(value);
});

count$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

count$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

count$.next(3); // logs: 3

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```

#### Call Signature

> \<`A`\>(): [`SourceObservable`](../types/observable-family.md#sourceobservable)\<`A`\>

Creates a new Observable source that can manually emit values.
This is the primary way to create root observables that start reactive chains.

##### Type Parameters

###### A

`A`

The type of values emitted by the source

##### Returns

[`SourceObservable`](../types/observable-family.md#sourceobservable)\<`A`\>

A SourceObservable that can emit values via `.next()` method

##### Example

```ts
//  Timeline:
//
//  count$    1     2     3     ...
//
//  Explanation:
//  - source creates a new observable that you can manually emit values to
//  - Use .next() to emit values
//  - Foundation for building custom observables

const count$ = source<number>();

const mut_history: number[] = [];

count$.subscribe((value) => {
  mut_history.push(value);
});

count$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

count$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

count$.next(3); // logs: 3

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```

#### See

source

## Functions

### source()

#### Call Signature

> **source**\<`A`\>(`initialValue`): [`InitializedSourceObservable`](../types/observable-family.md#initializedsourceobservable)\<`A`\>

Defined in: [core/create/source.mts:47](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/source.mts#L47)

Creates a new Observable source that can manually emit values.
This is the primary way to create root observables that start reactive chains.

##### Type Parameters

###### A

`A`

The type of values emitted by the source

##### Parameters

###### initialValue

`A`

##### Returns

[`InitializedSourceObservable`](../types/observable-family.md#initializedsourceobservable)\<`A`\>

A SourceObservable that can emit values via `.next()` method

##### Example

```ts
//  Timeline:
//
//  count$    1     2     3     ...
//
//  Explanation:
//  - source creates a new observable that you can manually emit values to
//  - Use .next() to emit values
//  - Foundation for building custom observables

const count$ = source<number>();

const mut_history: number[] = [];

count$.subscribe((value) => {
  mut_history.push(value);
});

count$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

count$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

count$.next(3); // logs: 3

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```

#### Call Signature

> **source**\<`A`\>(): [`SourceObservable`](../types/observable-family.md#sourceobservable)\<`A`\>

Defined in: [core/create/source.mts:49](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/create/source.mts#L49)

Creates a new Observable source that can manually emit values.
This is the primary way to create root observables that start reactive chains.

##### Type Parameters

###### A

`A`

The type of values emitted by the source

##### Returns

[`SourceObservable`](../types/observable-family.md#sourceobservable)\<`A`\>

A SourceObservable that can emit values via `.next()` method

##### Example

```ts
//  Timeline:
//
//  count$    1     2     3     ...
//
//  Explanation:
//  - source creates a new observable that you can manually emit values to
//  - Use .next() to emit values
//  - Foundation for building custom observables

const count$ = source<number>();

const mut_history: number[] = [];

count$.subscribe((value) => {
  mut_history.push(value);
});

count$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

count$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

count$.next(3); // logs: 3

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```
