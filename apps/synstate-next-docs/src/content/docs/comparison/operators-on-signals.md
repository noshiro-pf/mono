---
title: Operators on signals
description: Why synstate-next's operators are not built on a signals library such as Preact Signals — what an operator written as an effect loses, and how synstate-dom-next builds the UI on synstate-next alone.
---

Preact Signals is glitch-free too, which raises a fair question: why not keep Preact Signals and add synstate-next's operators on top? A pure transform carries over as it is, since that is what a `computed` is. An operator that keeps state, waits or starts a request cannot be a `computed`, and becomes an `effect` that writes a signal. Written that way, it loses the two things synstate-next's operators keep: every reader sees a consistent graph, and every emission is an event.

The examples on this page use `@preact/signals-core`, and each one that runs a library is a test against it.

## What carries over

| Kind of operator                         | Examples                                        | Written with Preact Signals as                            | What is lost                                                                                                           |
| ---------------------------------------- | ----------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Pure synchronous transform               | `map`, `derive`, `combine`                      | a `computed`                                              | nothing                                                                                                                |
| A choice among signals that exist        | `switchMap` to one of several states            | a `computed` that reads `branches[selector.value]`        | nothing: the dependency follows the read                                                                               |
| State carried from one value to the next | `scan`, `pairwise`, `skip`, `take`              | an effect that writes a signal                            | events (an equal write is dropped, a batch delivers its last write), consistency for readers created earlier, laziness |
| Time                                     | `debounce`, `throttle`, `audit`, `timer`        | an effect that sets a timer and writes a signal           | laziness                                                                                                               |
| A request or a stream per value          | `switchMap`, `mergeMap`, `fromAbortablePromise` | an effect that writes a signal, and aborts in its cleanup | consistency for readers created earlier, when the inner value arrives at once (a loading state)                        |

The rows that lose something are the ones the next two sections run.

## An async step: the new query with the old list

The search box of [Async logic compared](/mono/synstate-next/comparison/async-logic/), reduced to its async step: a query, a request per query, and a view that shows the query beside what the list is for. Preact Signals has no `switchMap`, so the request is an effect that writes `searchState`, as on that page, and the view is another effect. The state, the request and what the view prints are shared by both versions:

```tsx
/** What the list under the search box shows. */
export type SearchState = Readonly<{
    status: 'loading' | 'success';
    query: string;
}>;

/** What each version returns: a way to type, and every run of the view. */
export type SearchView = Readonly<{
    setQuery: (query: string) => void;
    viewLog: readonly string[];
}>;

/** How long a request takes to answer. A timer stands in for it below. */
export const answerMs = 100;

export const showView = (query: string, state: SearchState): string =>
    `${query} / ${state.status} for ${state.query}` as const;
```

```tsx
export const createSearchView = (viewCreatedFirst: boolean): SearchView => {
    const query = signal('a');

    const searchState = signal<SearchState>({ status: 'loading', query: 'a' });

    // What the page shows: the query in the box, and what the list is for.
    const view = computed(() => showView(query.value, searchState.value));

    const viewLog: string[] = [];

    const watchView = (): void => {
        effect(() => {
            viewLog.push(view.value);
        });
    };

    // switchMap((q) => request(q)), written as an effect.
    const search = (): void => {
        effect(() => {
            const q = query.value;

            searchState.value = { status: 'loading', query: q };

            const answer = setTimeout(() => {
                searchState.value = { status: 'success', query: q };
            }, answerMs);

            // A newer query cancels the request in flight.
            return () => {
                clearTimeout(answer);
            };
        });
    };

    // Nothing but the order the two effects are created in differs.
    if (viewCreatedFirst) {
        watchView();

        search();
    } else {
        search();

        watchView();
    }

    return {
        setQuery: (q) => {
            query.value = q;
        },
        viewLog,
    };
};
```

Once the answer for `a` has arrived, `setQuery('ab')` runs the view twice when it was created first: with `ab / success for a`, the new query beside the list for the old one, and then with `ab / loading for ab`. Created after the search effect, it runs once, with `ab / loading for ab`. A write reaches both effects, and here they run in the order they were created, not in the order one depends on the other. The `computed` between them is glitch-free when it is read; the effect that writes `searchState` is outside what that guarantee covers.

In synstate-next, the request is a node of the graph:

```tsx
export const createSearchView = (): SearchView => {
    const [query, setQuery] = createState('a');

    // A newer query disposes the previous inner observable, which cancels its
    // request.
    const searchState = query.pipe(
        switchMap((q) =>
            timer(answerMs).pipe(
                map((): SearchState => ({ status: 'success', query: q })),
                // held in the same update as the query
                withInitialValue<SearchState>({ status: 'loading', query: q }),
            ),
        ),
    );

    // What the page shows: the query in the box, and what the list is for.
    const view = combine([query, searchState]).pipe(
        map(([q, state]) => showView(q, state)),
    );

    const mut_viewLog: string[] = [];

    view.subscribe((v) => {
        mut_viewLog.push(v);
    });

    return { setQuery, viewLog: mut_viewLog };
};
```

`switchMap` passes on the inner observable's first value, the loading state, within the update that changed the query, so `view`, below both, runs once with `ab / loading for ab`, and once more with `ab / success for ab` when the answer arrives. (`switchMap` also projects the `'a'` that `query` holds when it is created, so `a` is requested as the Preact effect requests it.) There is no order to get wrong: a derived node runs at its depth in the graph, not in the order it was created, and the subscriber runs after every derived node, against a graph that has settled.

Not every library is in this position. Jotai's async atoms and Solid's `createResource` are derived nodes of their own graphs, and the same view written with them (`unwrap`, `resource.loading`) runs once per query. MobX, where the request is a `reaction` that writes an observable, behaves as Preact Signals does. The [Evaluation models](/mono/synstate-next/comparison/libraries/#evaluation-models) table lists each library.

## A stateful step: events counted as values

A signal holds a current value. A write equal to the value it holds (`!==`) changes nothing and notifies no one, and the effects a `batch` reaches run once, after its last write. Both are right for state. An operator that counts or pairs events needs every one of them, and over a signal it gets values.

```tsx
import { batch, effect, signal } from '@preact/signals-core';

// A click on a list item, sent as the item's id.
const clicked = signal<string | undefined>(undefined);

const clickCount = signal(0);

// scan((n) => n + 1, 0), written as an effect.
effect(() => {
    if (clicked.value !== undefined) {
        clickCount.value = clickCount.peek() + 1;
    }
});

clicked.value = 'A';

clicked.value = 'A'; // the same item again: an equal value, dropped

batch(() => {
    // two clicks handled in one batch: the effect sees only the last
    clicked.value = 'B';

    clicked.value = 'C';
});

// 4 clicks, counted as 2
```

In synstate-next, an emitter's every emission is an event, whatever its value, and emissions given inside a `batch` are each delivered in a round of their own ([State and writes](/mono/synstate-next/guides/state-and-writes/)):

```tsx
import { batch, createValueEmitter, scan } from 'synstate-next';

// A click on a list item, sent as the item's id.
const [clicked, click] = createValueEmitter<string>();

const clickCount = clicked.pipe(scan((n) => n + 1, 0));

let mut_count = 0;

clickCount.subscribe((n) => {
    mut_count = n;
});

click('A');

click('A'); // every emission is an event, equal or not

batch(() => {
    // two clicks in one batch: each is delivered in a round of its own
    click('B');

    click('C');
});

// 4 clicks, counted as 4
```

`createState` holds a state, as a signal does: it drops a write equal to the value it holds, and when it is written more than once before its round (in a `batch`, while the derived values are computed, or by effects of the same round), what follows sees one value, the one it holds when the round starts; an event goes through `createValueEmitter` or `source`, which pass on every emission. With Preact Signals alone, the click handler would count the click itself. That works, and it is the point: the counting is code at the place that writes, not an operator that can be put after any signal.

## What fixing it would take

For the effect-based operators to be glitch-free, each would have to run before every effect that reads what it writes: in depth order. Preact Signals exposes neither a node's depth nor the order its effects run in, so the operators would have to keep depths of their own and route their writes through a queue of their own. That is synstate-next's depth-ordered queue, rebuilt on top of Preact Signals, with Preact Signals' own marking and version checks still paid underneath. Counting events would also mean wrapping every write in a new object and keeping writes out of batches, which is using signals as an event stream.

An effect also subscribes to everything it reads and runs again on every change, whether or not anything reads what it writes. Below an effect-based operator, the graph is therefore eager, as synstate-next's is, and the lazy `computed` and the dependency tracking that let Preact Signals skip work apply to the `computed` parts only.

## The model, not the operators

A consistent graph for every reader and an event for every emission are not operators that Preact Signals is missing. Both come from the model underneath: an update that runs each node it reaches in depth order, and an emitter (`createValueEmitter`, `source`) that passes on every emission. A Preact signal holds a current value, and nothing orders its effects by where they sit in the graph; an operator written as an effect inherits that model, and getting synstate-next's guarantees back means building synstate-next's model again inside it, as the previous section shows. The savings would not survive the trip either, since what lets Preact Signals skip work applies only to the part that already carries over. What synstate-next offers is its operators together with the model that keeps them sound: an async or stateful step is a node in the same glitch-free graph as every derived value, and a stateful step such as `scan` sees every emission of the emitter it follows.

## Building the UI on synstate-next

The way to put synstate-next on the screen is [synstate-dom-next](/mono/synstate-dom-next/). It binds observables directly to the DOM: a component runs once, and an update goes from the graph straight to the attribute, property or text node bound to it, with no virtual DOM and no component re-run. Its bindings are effects of the same scheduler, so they run after the derived values of each round, as a subscriber does. The search step above is then one graph from the query to what the page shows, with no point where an observable has to become something else, and one owner that tears down a component's requests, timers and bindings together.

synstate-next has no bridge to Preact Signals yet. Where a pipeline's result has to reach another library, `subscribe` hands it every settled value, and the seam is where the guarantees above stop: every value that crosses it is converted, and an event that enters a signal becomes a value.
