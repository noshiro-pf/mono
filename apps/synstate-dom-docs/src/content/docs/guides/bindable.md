---
title: Bindable values
description: constant, pipe(map), and what a slot that takes data accepts.
---

Every place in JSX that takes data (an attribute, a DOM property, a text child, or a prop of a component the library provides) accepts a `Bindable<T>`:

| `Bindable<T>` is one of    | what happens when it is bound                                      |
| :------------------------- | :----------------------------------------------------------------- |
| `InitializedObservable<T>` | written once with its current value, then again on every new value |
| `Constant<T>`              | written once; nothing is subscribed                                |

An observable that has already completed, such as `just(...)`, is treated like a constant: written once and never subscribed to.

## `constant`

A plain value is not a `Bindable`. When a value never changes, you wrap it in `constant(...)` to say so:

```tsx
import { createState } from 'synstate';
import { constant, type JSX } from 'synstate-dom';

const [count$] = createState(0);

export const Counter = (): JSX.Element => (
    <p title={constant('A counter')}>
        {constant('Count: ')}
        {count$}
    </p>
);

// @ts-expect-error A plain string is not a Bindable: write constant('Hi').
export const Plain = (): JSX.Element => <p>{'Hi'}</p>;

// @ts-expect-error A snapshot would be written once and never updated.
export const Stale = (): JSX.Element => <p>{count$.getSnapshot().value}</p>;
```

`constant` just returns its argument. `Constant<T>` exists only in the types, so it costs nothing at run time. `constant('button')` keeps the literal type `Constant<'button'>`.

The rule is there for the second error above. `{count$.getSnapshot().value}` reads the state once and writes a number that never updates. If plain values were accepted, it would compile and show the right number, right up until the first update. Here it does not compile at all.

Things that are not data take plain values: event handlers, `ref`, the `key` function of `For`, and functions that return children.

- `constant` rejects `null` and `undefined`. To leave an attribute out, omit the prop; for a value that is only sometimes absent, use an `InitializedObservable<T | undefined>`.
- `constant(obs$)` is a type error too.
- If `constant` is too long to type, rename it on import: `import { constant as c } from 'synstate-dom'`.

## Transforming an observable: `pipe(map)`

To show an observable transformed, write `source$.pipe(map(fn))`. There is no separate form for bindings: a slot takes the `map` node like any other observable. Created inside a component, or inside a row of `For`, the node belongs to that scope and is disposed with it:

```tsx
import { createState, map } from 'synstate';
import { constant, For, type JSX } from 'synstate-dom';

const [count$, setCount] = createState(0);

export const Counter = (): JSX.Element => (
    <div>
        {/* A `map` node, created in the component: it lives while it is mounted. */}
        <p>{count$.pipe(map((n) => `${n} items`))}</p>
        <button
            type={constant('button')}
            disabled={count$.pipe(map((n) => n === 0))}
            onClick={() => {
                setCount(0);
            }}
        >
            {constant('Reset')}
        </button>
    </div>
);

type Item = Readonly<{ id: number; price: number }>;

const [items$] = createState<readonly Item[]>([
    { id: 1, price: 120 },
    { id: 2, price: 80 },
]);

export const PriceList = (): JSX.Element => (
    <ul>
        <For items={items$} key={(item) => item.id}>
            {/* One `map` node per row, disposed with the row. */}
            {(item$) => (
                <li>{item$.pipe(map((item) => `${item.price} yen`))}</li>
            )}
        </For>
    </ul>
);
```

A `map` node computes `fn` once per update and passes on a result only when it is not `Object.is` the last one, so a binding writes to the DOM only when what it shows changed. The result is an observable like any other: several bindings, `getSnapshot()` and further operators can all read it.

## Receiving a `Bindable`: `mapBindable`, `deriveBindable`, `toObservable`

Inside a component that takes `label: Bindable<string>`, you cannot call `label.pipe(...)`, because `label` may be a constant. Three helpers cover that case:

| helper                      | given constants                     | given an observable           |
| :-------------------------- | :---------------------------------- | :---------------------------- |
| `mapBindable(b, f)`         | applies `f` once, returns constant  | `b.pipe(map(f))`              |
| `deriveBindable([a, b], f)` | all constants: `f` once, a constant | `derive`, constants as `just` |
| `toObservable(b)`           | `just(b)`                           | `b` itself                    |

Anything derived from constants stays a constant, so the static parts of a view never enter the graph.

```tsx
import { debounce, withInitialValue } from 'synstate';
import {
    deriveBindable,
    mapBindable,
    toObservable,
    type Bindable,
    type JSX,
} from 'synstate-dom';

type SearchSummaryProps = Readonly<{
    query: Bindable<string>;
    hits: Bindable<number>;
}>;

export const SearchSummary = ({
    query,
    hits,
}: SearchSummaryProps): JSX.Element => {
    // A constant `hits` gives a constant, and an observable a `map` node.
    const hitsLabel = mapBindable(hits, (n) =>
        n === 1 ? '1 hit' : `${n} hits`,
    );

    // All constants: `fn` runs once and the result is a constant.
    // Otherwise: one node, synstate's `derive`.
    const heading = deriveBindable([query, hits], (q, n) =>
        n === 0 ? `Nothing for "${q}"` : `Results for "${q}"`,
    );

    // Only where an observable is really needed: here, to apply an operator.
    const settledQuery = toObservable(query)
        .pipe(debounce(300))
        .pipe(withInitialValue(''));

    return (
        <header>
            <h2>{heading}</h2>
            <p>{hitsLabel}</p>
            <small>{settledQuery}</small>
        </header>
    );
};
```

Use `toObservable` only where you really need an observable, such as to apply an operator. Turning a constant into an observable adds it to the graph, which `mapBindable` and `deriveBindable` avoid.
