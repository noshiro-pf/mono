[**syncflow**](../../README.md)

***

[syncflow](../../README.md) / core/create/source

# core/create/source

## Variables

### subject()

> `const` **subject**: \{\<`A`\>(`initialValue`): [`InitializedSourceObservable`](../types/observable-family.md#initializedsourceobservable)\<`A`\>; \<`A`\>(): [`SourceObservable`](../types/observable-family.md#sourceobservable)\<`A`\>; \} = `source`

Defined in: [core/create/source.mts:40](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/create/source.mts#L40)

Alias for `source()`. Creates a new Observable source.

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
const count$ = source<number>();

count$.subscribe((value) => {
  console.log(value);
});

count$.next(1); // logs: 1

count$.next(2); // logs: 2
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
const count$ = source<number>();

count$.subscribe((value) => {
  console.log(value);
});

count$.next(1); // logs: 1

count$.next(2); // logs: 2
```

#### See

source

## Functions

### source()

#### Call Signature

> **source**\<`A`\>(`initialValue`): [`InitializedSourceObservable`](../types/observable-family.md#initializedsourceobservable)\<`A`\>

Defined in: [core/create/source.mts:28](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/create/source.mts#L28)

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
const count$ = source<number>();

count$.subscribe((value) => {
  console.log(value);
});

count$.next(1); // logs: 1

count$.next(2); // logs: 2
```

#### Call Signature

> **source**\<`A`\>(): [`SourceObservable`](../types/observable-family.md#sourceobservable)\<`A`\>

Defined in: [core/create/source.mts:30](https://github.com/noshiro-pf/syncflow/blob/main/packages/syncflow/src/core/create/source.mts#L30)

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
const count$ = source<number>();

count$.subscribe((value) => {
  console.log(value);
});

count$.next(1); // logs: 1

count$.next(2); // logs: 2
```
