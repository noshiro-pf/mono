[**synstate**](../../README.md)

***

[synstate](../../README.md) / core/operators/skip-if-no-change

# core/operators/skip-if-no-change

## Variables

### distinctUntilChanged()

> `const` **distinctUntilChanged**: \<`A`\>(`eq`) => [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\> = `skipIfNoChange`

Defined in: [core/operators/skip-if-no-change.mts:73](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/skip-if-no-change.mts#L73)

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
//  Timeline:
//
//  num$      1     1     2     2     2     3
//  distinct$ 1           2                 3
//
//  Explanation:
//  - skipIfNoChange filters out consecutive duplicate values
//  - Uses strict equality (===) for comparison
//  - Only emits when the value actually changes

const num$ = source<number>();

const distinct$ = num$.pipe(skipIfNoChange());

const mut_history: number[] = [];

distinct$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

num$.next(1); // nothing logged

assert.deepStrictEqual(mut_history, [1]);

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

num$.next(2); // nothing logged

num$.next(3); // logs: 3

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```

#### See

skipIfNoChange

## Functions

### skipIfNoChange()

> **skipIfNoChange**\<`A`\>(`eq?`): [`KeepInitialValueOperator`](../types/observable.md#keepinitialvalueoperator)\<`A`, `A`\>

Defined in: [core/operators/skip-if-no-change.mts:59](https://github.com/noshiro-pf/synstate/blob/main/packages/synstate/src/core/operators/skip-if-no-change.mts#L59)

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
//  Timeline:
//
//  num$      1     1     2     2     2     3
//  distinct$ 1           2                 3
//
//  Explanation:
//  - skipIfNoChange filters out consecutive duplicate values
//  - Uses strict equality (===) for comparison
//  - Only emits when the value actually changes

const num$ = source<number>();

const distinct$ = num$.pipe(skipIfNoChange());

const mut_history: number[] = [];

distinct$.subscribe((x) => {
  mut_history.push(x);
});

num$.next(1); // logs: 1

assert.deepStrictEqual(mut_history, [1]);

num$.next(1); // nothing logged

assert.deepStrictEqual(mut_history, [1]);

num$.next(2); // logs: 2

assert.deepStrictEqual(mut_history, [1, 2]);

num$.next(2); // nothing logged

num$.next(3); // logs: 3

assert.deepStrictEqual(mut_history, [1, 2, 3]);
```
