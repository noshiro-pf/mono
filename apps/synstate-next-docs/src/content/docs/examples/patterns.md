---
title: Patterns
description: A debounced search with cancellation, a throttled refresh button, and a todo list with a reducer and derived views.
---

## Search with debounce

A debounced search that cancels the request it no longer needs, keeps the last results while a request fails, and starts with an empty list:

```tsx
import {
    createState,
    debounce,
    filter,
    fromAbortablePromise,
    just,
    map,
    switchMap,
    withInitialValue,
    type InitializedObservable,
} from 'synstate-next';
import { Result } from 'ts-std-forge';

type Item = Readonly<{ id: string; name: string }>;

const [query, setQuery] = createState('');

const responses = query.pipe(debounce(300)).pipe(
    // A query too short to search follows an empty answer, which also
    // disposes the request in flight.
    switchMap((q) =>
        q.length <= 2
            ? just(Result.ok<readonly Item[]>([]))
            : fromAbortablePromise(async (signal) => {
                  const params = new URLSearchParams({ q });

                  return fetch(`/api/search?${params.toString()}`, {
                      signal,
                  }).then(async (r) => r.json() as Promise<readonly Item[]>);
              }),
    ),
);

const results: InitializedObservable<readonly Item[]> = responses
    // A failed request leaves the results as they were.
    .pipe(filter(Result.isOk))
    .pipe(map((result) => result.value))
    // The empty query has answered `[]` already, but `switchMap`'s type
    // says it may hold nothing: name the list it starts with.
    .pipe(withInitialValue<readonly Item[]>([]));
```

A query too short to search goes through `switchMap` too, to an empty answer: dropped with `filter` before it, it would leave the request for a longer query running. The result is an `InitializedObservable`, so a view reads `results.value` from the start. With synstate-dom-next, `For` binds it to a list directly.

## A throttled refresh button

`createEventEmitter` gives an event with no value and the function that fires it, which is what a button's `onClick` takes:

```tsx
import { createEventEmitter, throttle } from 'synstate-next';

// `refreshClicked: Observable<void>`, `onRefreshClick: () => void`.
const [refreshClicked, onRefreshClick] = createEventEmitter();

// `refresh` stands for the work the button does.
// At most one refresh every 2 seconds, however fast the clicks come.
refreshClicked.pipe(throttle(2000)).subscribe(() => {
    refresh();
});

// <button onClick={onRefreshClick}>Refresh</button>
```

## A todo list

A reducer for the list, a state for the filter, and two derived views. Each view is computed once per update, from both of its parents, and stops the update when it does not change:

```tsx
import { createReducer, createState, derive, map } from 'synstate-next';
import { Arr } from 'ts-data-forge';

type Todo = Readonly<{ id: number; title: string; done: boolean }>;

// `nextId` only grows, so an id is never given twice, even after a remove.
type Todos = Readonly<{ items: readonly Todo[]; nextId: number }>;

type Action = Readonly<
    | { type: 'add'; title: string }
    | { type: 'toggle'; id: number }
    | { type: 'remove'; id: number }
>;

const reducer = (state: Todos, action: Action): Todos => {
    switch (action.type) {
        case 'add':
            return {
                items: Arr.toPushed(state.items, {
                    id: state.nextId,
                    title: action.title,
                    done: false,
                }),
                nextId: state.nextId + 1,
            };

        case 'toggle':
            return {
                ...state,
                items: state.items.map((t) =>
                    t.id === action.id ? { ...t, done: !t.done } : t,
                ),
            };

        case 'remove':
            return {
                ...state,
                items: state.items.filter((t) => t.id !== action.id),
            };
    }
};

const [todos, dispatch] = createReducer(reducer, { items: [], nextId: 1 });

const [filterBy, setFilterBy] = createState<'all' | 'active' | 'done'>('all');

const visible = derive([todos, filterBy], ({ items }, by) =>
    by === 'all' ? items : items.filter((t) => t.done === (by === 'done')),
);

const remaining = todos.pipe(
    map(({ items }) => items.filter((t) => !t.done).length),
);

dispatch({ type: 'add', title: 'Write the docs' });

dispatch({ type: 'add', title: 'Review them' });

dispatch({ type: 'toggle', id: 1 });

setFilterBy('active');

assert.deepStrictEqual(
    visible.value.map((t) => t.title),
    ['Review them'],
);

assert.strictEqual(remaining.value, 1);
```
