[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/skip-if-no-change

# core/operators/skip-if-no-change

## Variables

### distinctUntilChanged()

> `const` **distinctUntilChanged**: \<`A`\>(`eq`) => [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\> = `skipIfNoChange`

Defined in: [core/operators/skip-if-no-change.mts:49](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/skip-if-no-change.mts#L49)

Alias for `skipIfNoChange()`.

Skips emissions if the value hasn't changed from the previous emission.
Uses a custom equality function or Object.is by default.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### eq?

(`x`, `y`) => `boolean`

Equality comparison function (default: Object.is)

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

An operator that skips duplicate consecutive values

#### Example

```ts
const num$ = source<number>();

const distinct$ = num$.pipe(skipIfNoChange());

distinct$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // logs: 1

num$.next(1); // nothing logged

num$.next(2); // logs: 2
```

#### See

skipIfNoChange

## Functions

### skipIfNoChange()

> **skipIfNoChange**\<`A`\>(`eq?`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/skip-if-no-change.mts:35](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/skip-if-no-change.mts#L35)

Skips emissions if the value hasn't changed from the previous emission.
Uses a custom equality function or Object.is by default.

#### Type Parameters

##### A

`A`

The type of values from the source

#### Parameters

##### eq?

(`x`, `y`) => `boolean`

Equality comparison function (default: Object.is)

#### Returns

[`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

An operator that skips duplicate consecutive values

#### Example

```ts
const num$ = source<number>();

const distinct$ = num$.pipe(skipIfNoChange());

distinct$.subscribe((x) => {
  console.log(x);
});

num$.next(1); // logs: 1

num$.next(1); // nothing logged

num$.next(2); // logs: 2
```
