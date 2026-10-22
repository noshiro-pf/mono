---
title: Bindable values
description: constant, view, and what a slot that takes data accepts.
---

Every place in JSX that takes data, an attribute, a DOM property, a text child or the props of a component the library provides, accepts a `Bindable<T>`:

| `Bindable<T>` is one of    | what happens when it is bound                                       |
| :------------------------- | :------------------------------------------------------------------ |
| `InitializedObservable<T>` | written once with its current value, then again on every new value  |
| `Constant<T>`              | written once; nothing is subscribed                                 |
| `View<T>`                  | its source is subscribed, and each value is transformed and written |

An observable that has already completed (such as `just(...)`) is written once and not subscribed, the same as a constant.

## `constant`

A plain value is not a `Bindable`. A value that never changes is wrapped in `constant(...)`, so that it says so:

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

`constant` returns its argument as it is; `Constant<T>` exists only in the types, and costs nothing at run time. `constant('button')` keeps the literal type `Constant<'button'>`.

The rule exists for the second error above: `{count$.getSnapshot().value}` reads the state once and writes a number that is never updated. With plain values accepted, that compiles and renders the right number until the first update. Here it does not compile.

Some things are not data and take plain values: event handlers, `ref`, the `key` function of `For`, and functions that return children.

- `null` and `undefined` are rejected by `constant`. An attribute that is absent is an omitted prop; a value that is sometimes absent is an `InitializedObservable<T | undefined>`.
- `constant(obs$)` is a type error too.
- If `constant` is too long to type, rename it on import: `import { constant as c } from 'synstate-dom'`.

## `view`

`view(source$, fn)` is an observable together with a light transformation. It can go wherever a `Bindable` goes:

```tsx
import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';

const [count$, setCount] = createState(0);

export const Counter = (): JSX.Element => (
    <div>
        {/* `view` transforms in the subscriber: no node joins the graph. */}
        <p>{view(count$, (n) => `${n} items`)}</p>
        <button
            type={constant('button')}
            disabled={view(count$, (n) => n === 0)}
            onClick={() => {
                setCount(0);
            }}
        >
            {constant('Reset')}
        </button>
    </div>
);
```

A `view` creates no node in the synstate graph: the binding subscribes to `source$` and calls `fn` on each value before writing it. With one input there is nothing for a glitch to come from, and it is shorter than `count$.pipe(map(fn))`.

`fn` is called on every value, once for each place the view is bound: passing the same `view` to two places calls it twice, since nothing is shared between them. A heavy transformation, or one whose result several bindings use, is better made into a node with `pipe(map(...))`.

## Receiving a `Bindable`: `mapBindable`, `derive`, `toObservable`

A component that takes `label: Bindable<string>` cannot call `label.pipe(...)`, since `label` may be a constant. Three helpers cover that:

| helper              | given constants                     | given an observable                    | given a view                 |
| :------------------ | :---------------------------------- | :------------------------------------- | :--------------------------- |
| `mapBindable(b, f)` | applies `f` once, returns constant  | `b.pipe(map(f))`                       | a composed view; no node     |
| `derive([a, b], f)` | all constants: `f` once, a constant | `combine` + `map`, constants as `just` | views made observables first |
| `toObservable(b)`   | `just(b)`                           | `b` itself                             | `source.pipe(map(fn))`       |

What is derived from constants stays a constant, so the static parts of a view never enter the graph.

```tsx
import { debounce, withInitialValue } from 'synstate';
import {
    derive,
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
    // A constant `hits` gives a constant, an observable a `map` node, and a
    // view a composed view.
    const hitsLabel = mapBindable(hits, (n) =>
        n === 1 ? '1 hit' : `${n} hits`,
    );

    // All constants: `fn` runs once and the result is a constant.
    // Otherwise: `combine` and `map`.
    const heading = derive([query, hits], (q, n) =>
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

Use `toObservable` only where an observable is really needed, such as to apply an operator: a constant made into an observable joins the graph, which `mapBindable` and `derive` avoid.
