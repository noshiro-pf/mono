---
title: Async Logic Compared
description: One production-grade search box (debounce, cancellation, loading and error states, teardown) written with SynState, RxJS, MobX, Jotai, Redux Toolkit, Solid and Preact Signals.
sidebar:
    order: 6
---

[Declarative State Management](/mono/synstate/guides/declarative-state-management/#precise-control-over-async-behavior) compares a SynState pipeline of `debounce`, `switchMap` and `fromAbortablePromise` with the same search box written in a React `useEffect`. This page writes that search box with each library the [benchmark](/mono/synstate/guides/library-comparison/benchmark/) measures on derived graphs, to the standard production code needs, so that the difference left is what each library gives you and what you write yourself. (Zustand and Valtio, measured on a single state only, have no derived or async primitive to compare.)

## The Specification

Every implementation on this page does all of the following, and each one runs the same test suite against itself (`libs/synstate/samples/docs-site/async-comparison/search-test-suite.mts`, with fake timers and a fake `fetch`):

1. **Debounce**: send a request only once typing has paused for 300 ms.
2. **Normalize and deduplicate**: trim the query, and do not send the same query twice in a row (compared after the debounce, so a query edited and restored before the pause is not sent again). Retrying a failed query is therefore left to a retry control, which this page does not add.
3. **Blank query**: a blank query shows nothing (`idle`) and cancels the request in flight.
4. **Cancel replaced requests**: a newer query aborts the previous request through its `AbortSignal`, and nothing the previous request returns is shown.
5. **Loading state**: `loading` from the moment a request is sent.
6. **Errors**: an HTTP error, a network error and a malformed body each show `error`, and the next query recovers from it.
7. **Teardown**: disposing of the search box aborts the request in flight and drops the query still waiting for the pause.

The suite also checks the edges between them: a typed space restarts the wait, typing back to the query in flight keeps that request, and nothing a replaced or disposed request returns is shown. Every case runs twice, against `fetch` and against a promise API that ignores its signal and answers anyway.

The state they produce and the request they send are shared, since neither depends on the library:

```tsx
export type Item = Readonly<{ id: string; title: string }>;

/** What the search box shows. Every implementation on this page produces it. */
export type SearchState = Readonly<
    | { status: 'idle' }
    | { status: 'loading'; query: string }
    | { status: 'success'; query: string; items: readonly Item[] }
    | { status: 'error'; query: string; message: string }
>;

export const idleState: SearchState = { status: 'idle' } as const;

export const debounceMs = 300;

export const searchUrl = (query: string): string => {
    const params = new URLSearchParams({ q: query });

    return `/api/search?${params.toString()}`;
};

/** Rejects on a non-2xx status and on a body that is not a list of items. */
export const parseResponse = async (
    response: Response,
): Promise<readonly Item[]> => {
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const body: unknown = await response.json();

    if (!Arr.isArray(body) || !body.every(isItem)) {
        throw new TypeError('Unexpected response body');
    }

    return body;
};

/** `fetch` rejects with an `AbortError` once `signal` is aborted. */
export const fetchItems = (
    query: string,
    signal: AbortSignal,
): Promise<readonly Item[]> =>
    fetch(searchUrl(query), { signal }).then(parseResponse);

export const toErrorMessage = (error: unknown): string =>
    isRecord(error) && isString(error['message'])
        ? error['message']
        : 'Unknown error';

const isItem = (u: unknown): u is Item =>
    isRecord(u) && isString(u['id']) && isString(u['title']);
```

Each implementation is a `createSearch()` factory, so that every test gets a fresh one; a search box that lives as long as the page could run the same code once at module scope. Imports and the adapter each sample hands the test suite are left out of the listings.

## At a Glance

What each library provides for each requirement, and where the code below writes it by hand:

| Requirement                     | SynState                             | RxJS                                 | MobX                                    | Jotai                                                     | Redux Toolkit                         | Solid                      | Preact Signals             |
| :------------------------------ | :----------------------------------- | :----------------------------------- | :-------------------------------------- | :-------------------------------------------------------- | :------------------------------------ | :------------------------- | :------------------------- |
| Debounce                        | `debounce`                           | `debounceTime`                       | by hand[^mobx-delay]                    | by hand                                                   | `cancelActiveListeners()` + `delay()` | by hand (`onCleanup`)      | by hand (effect cleanup)   |
| Skip an unchanged query         | `map` (passes on only a change)      | `distinctUntilChanged`               | by hand                                 | atom equality                                             | by hand (compared with the store)     | signal equality            | signal equality            |
| Abort a replaced request        | `switchMap` + `fromAbortablePromise` | `switchMap` + `fromFetch`[^rx-fetch] | by hand                                 | the read's `signal`                                       | the listener's `signal`               | by hand[^solid-signal]     | by hand (effect cleanup)   |
| Report nothing for that request | built in                             | built in                             | by hand (`signal.aborted`)              | built in; on dispose, by hand                             | by hand (`signal.aborted`)            | built in                   | by hand (`signal.aborted`) |
| Loading state                   | `withInitialValue`                   | `startWith`                          | set by hand                             | `unwrap` + a derived atom                                 | an action                             | `resource.state`           | set by hand                |
| Errors                          | values (`Result`)                    | `catchError` inside `switchMap`      | `catch`                                 | `catch` in the read                                       | `catch` in the listener               | `resource.state`           | `catch`                    |
| Teardown                        | `scope.dispose()`                    | `unsubscribe()`, `complete()`        | reaction, timer and controller, by hand | subscription, timer and controller, by hand[^jotai-abort] | `clearListeners()`                    | `createRoot`'s `dispose()` | both effects' disposers    |
| Runs before anything subscribes | yes                                  | no (cold)                            | yes                                     | no (lazy)                                                 | yes                                   | yes                        | yes                        |

[^mobx-delay]: `reaction`'s `delay` option runs the effect `delay` ms after the _first_ change and is not restarted by later ones, which throttles rather than debounces.

[^rx-fetch]: `fromFetch` aborts the `fetch` it started. Any other promise API that takes an `AbortSignal` (an SDK, `IndexedDB` wrappers) needs a `new Observable` written around an `AbortController`.

[^solid-signal]: `createResource` ignores a stale response, but in Solid 1.x it hands the fetcher no `AbortSignal`.

[^jotai-abort]: Jotai aborts a read's `signal` when a dependency changes and the atom is read again, not when its last subscriber leaves.

The notes after each listing mark a strength with ✅, a drawback with ⚠️, and a trade-off or a side note with ℹ️.

## SynState

```tsx
export const createSearch = () => {
    // Everything created inside `run` is torn down by `scope.dispose()`.
    // A search box that lives as long as the page can skip the scope.
    const scope = createScope();

    return scope.run(() => {
        const [query, setQuery] = createState('');

        const searchState = query
            .pipe(debounce(debounceMs)) // wait for typing to pause
            .pipe(map((q) => q.trim())) // map passes on only a changed query
            .pipe(
                // A newer query completes the previous inner observable, and completing
                // it aborts its request.
                switchMap((q): Observable<SearchState> =>
                    q === ''
                        ? just(idleState)
                        : fromAbortablePromise((signal) =>
                              fetchItems(q, signal),
                          )
                              .pipe(
                                  // A rejection arrives as a value: Result.err(error)
                                  map((result): SearchState =>
                                      Result.isOk(result)
                                          ? {
                                                status: 'success',
                                                query: q,
                                                items: result.value,
                                            }
                                          : {
                                                status: 'error',
                                                query: q,
                                                message: toErrorMessage(
                                                    result.value,
                                                ),
                                            },
                                  ),
                              )
                              .pipe(
                                  // emitted as soon as the request starts
                                  withInitialValue<SearchState>({
                                      status: 'loading',
                                      query: q,
                                  }),
                              ),
                ),
            )
            .pipe(withInitialValue(idleState));

        return {
            setQuery,
            searchState,
            dispose: () => {
                scope.dispose();
            },
        };
    });
};
```

- ✅ **Each requirement is one operator** on one pipeline, read top to bottom in the order the query goes through them. Adding another (a minimum query length, a retry) is one more `pipe`.
- ✅ **`map` deduplicates.** It passes on a result only when it differs from the previous one (`Object.is`), so the trimmed query needs no `skipIfNoChange` after it.
- ✅ **Cancellation is the structure, not code.** `switchMap` completes the previous inner observable, `fromAbortablePromise` aborts its `AbortController` when it completes, and the `AbortError` that follows is swallowed. Nothing checks `signal.aborted`.
- ✅ **An error is a value.** `fromAbortablePromise` emits `Result.ok` or `Result.err` and never throws into the pipeline, so a failed request cannot end it, wherever the error is handled.
- ✅ **`searchState` always has a value**, readable with `getSnapshot()` or `useObservableValue`, and the pipeline runs whether anything subscribes or not.
- ✅ **Teardown disposes, it does not complete.** `scope.dispose()` drops `debounce`'s pending query instead of emitting it, and aborts the request in flight.
- ⚠️ **The operators have to be learned.** Reading the pipeline takes knowing what `debounce`, `switchMap` and `fromAbortablePromise` guarantee, as it does with RxJS.

## RxJS

```tsx
export const createSearch = () => {
    const query$ = new Subject<string>();

    // An RxJS observable holds no current value; a BehaviorSubject keeps one.
    const searchState$ = new BehaviorSubject<SearchState>(idleState);

    const subscription = query$
        .pipe(
            debounceTime(debounceMs), // wait for typing to pause
            map((q) => q.trim()),
            distinctUntilChanged(), // skip a query that did not change
            // A newer query unsubscribes from the previous request, and fromFetch
            // aborts a request it is unsubscribed from.
            switchMap((q): Observable<SearchState> =>
                q === ''
                    ? of(idleState)
                    : fromFetch(searchUrl(q), { selector: parseResponse }).pipe(
                          map((items): SearchState => ({
                              status: 'success',
                              query: q,
                              items,
                          })),
                          // Caught inside switchMap: an error that reached the outer pipe
                          // would end it, and the search box with it.
                          catchError((error: unknown) =>
                              of<SearchState>({
                                  status: 'error',
                                  query: q,
                                  message: toErrorMessage(error),
                              }),
                          ),
                          startWith<SearchState>({
                              status: 'loading',
                              query: q,
                          }),
                      ),
            ),
        )
        .subscribe(searchState$);

    return {
        setQuery: (q: string) => {
            query$.next(q);
        },
        searchState$,
        dispose: () => {
            subscription.unsubscribe();

            searchState$.complete();
        },
    };
};
```

- ℹ️ **The same vocabulary as SynState**, and as short. The differences are in what the operators guarantee.
- ⚠️ **Where `catchError` goes decides whether the search box survives its first error.** Inside `switchMap` it replaces the failed request; one level out, the error completes the outer pipe and later queries are ignored for good. Neither placement is a type error.
- ⚠️ **There is no current value** until a `BehaviorSubject` (or `shareReplay`) holds one.
- ℹ️ **Nothing runs until something subscribes**, and each subscriber to a cold pipeline would send requests of its own, so the code subscribes once and hands out the `BehaviorSubject`.
- ⚠️ **`fromFetch` covers `fetch` only.** SynState's `fromAbortablePromise` takes any `(signal) => Promise`.
- ⚠️ **Derived values are not glitch-free.** A search box has no diamond of its own, but once something combines two values derived from the same source, RxJS emits it once per path, the first time with one input stale ([How SynState Solved the Glitch](/mono/synstate/internals/how-synstate-solved-the-glitch/)).

## MobX

```tsx
export const createSearch = () => {
    const query = observable.box('');

    // `deep: false`: the state is replaced as a whole, never mutated.
    const searchState = observable.box<SearchState>(idleState, { deep: false });

    let mut_timer: ReturnType<typeof setTimeout> | undefined;

    let mut_controller: AbortController | undefined;

    let mut_lastQuery = '';

    const setSearchState = action((state: SearchState) => {
        searchState.set(state);
    });

    const search = (q: string): void => {
        mut_controller?.abort(); // cancel the request this query replaces

        if (q === '') {
            setSearchState(idleState);

            return;
        }

        const controller = new AbortController();

        mut_controller = controller;

        setSearchState({ status: 'loading', query: q });

        fetchItems(q, controller.signal)
            .then((items) => {
                if (!controller.signal.aborted) {
                    setSearchState({ status: 'success', query: q, items });
                }
            })
            .catch((error: unknown) => {
                // A replaced request rejects with an AbortError; it reports nothing.
                if (!controller.signal.aborted) {
                    setSearchState({
                        status: 'error',
                        query: q,
                        message: toErrorMessage(error),
                    });
                }
            });
    };

    // reaction's `delay` option runs the effect `delay` ms after the *first*
    // change, which throttles; a debounce is written by hand.
    const disposeReaction = reaction(
        () => query.get(), // untrimmed: a typed space restarts the wait too
        (typed) => {
            clearTimeout(mut_timer);

            mut_timer = setTimeout(() => {
                const q = typed.trim();

                if (q === mut_lastQuery) {
                    return;
                }

                mut_lastQuery = q;

                search(q);
            }, debounceMs);
        },
    );

    return {
        setQuery: action((q: string) => {
            query.set(q);
        }),
        searchState,
        dispose: () => {
            disposeReaction();

            clearTimeout(mut_timer);

            mut_controller?.abort();
        },
    };
};
```

- ⚠️ **MobX tracks state, not time.** Everything after "the trimmed query changed" is imperative code: the timer, the controller, the stale-response checks and the state transitions.
- ⚠️ **Deduplication needs its own variable.** `reaction` compares with the last _typed_ query, while the requirement is about the last one the debounce let through.
- ⚠️ **Three things to release** on teardown, each in its own variable; forgetting one leaves a timer or a request running.

## Jotai

```tsx
export const createSearch = () => {
    const store = createStore();

    // A primitive atom ignores a write equal to its value, so a query that did
    // not change triggers nothing.
    const debouncedQueryAtom = atom('');

    // Jotai has no debounce; a timer restarted on every keystroke.
    let mut_timer: ReturnType<typeof setTimeout> | undefined;

    const setQuery = (q: string): void => {
        clearTimeout(mut_timer);

        mut_timer = setTimeout(() => {
            store.set(debouncedQueryAtom, q.trim());
        }, debounceMs);
    };

    // Jotai aborts `signal` when a dependency changes and the atom is read again,
    // and ignores the promise it returned. Unsubscribing does not abort it, so
    // disposal brings a signal of its own.
    const disposal = new AbortController();

    const resultAtom = atom(
        (get, { signal }): SearchState | Promise<SearchState> => {
            const q = get(debouncedQueryAtom);

            return q === ''
                ? idleState
                : fetchSearchState(
                      q,
                      AbortSignal.any([signal, disposal.signal]),
                  );
        },
    );

    // An async atom suspends; unwrap turns the pending promise into a fallback
    // value, which carries no query of its own.
    const unwrappedAtom = unwrap(resultAtom, () => undefined);

    const searchStateAtom = atom(
        (get): SearchState =>
            get(unwrappedAtom) ?? {
                status: 'loading',
                query: get(debouncedQueryAtom),
            },
    );

    // Nothing is computed, and no request sent, until an atom is subscribed to
    // (useAtomValue in a component does this).
    const unsubscribe = store.sub(searchStateAtom, () => {});

    return {
        store,
        setQuery,
        searchStateAtom,
        dispose: () => {
            clearTimeout(mut_timer);

            unsubscribe();

            disposal.abort();
        },
    };
};

const fetchSearchState = async (
    q: string,
    signal: AbortSignal,
): Promise<SearchState> => {
    const state = await fetchItems(q, signal)
        .then((items): SearchState => ({ status: 'success', query: q, items }))
        .catch((error: unknown): SearchState => ({
            status: 'error',
            query: q,
            message: toErrorMessage(error),
        }));

    // Aborted (disposed of, or replaced and ignored anyway): show nothing new.
    return signal.aborted ? { status: 'loading', query: q } : state;
};
```

- ✅ **Cancellation is built in**, the closest any non-Observable library here comes: the read function gets a `signal` that a new query aborts, and a stale promise is never shown.
- ⚠️ **Loading without Suspense takes two atoms.** `unwrap` replaces the pending promise with a fallback that cannot see the query, so a derived atom adds it. The blank query is returned synchronously rather than from an `async` function, or it too would show `loading` until its promise settled.
- ⚠️ **Disposal takes `AbortSignal.any`**, which joins Jotai's signal with the one for disposal; it needs Chrome 116, Firefox 124, Safari 17.4 or Node 20.3, or newer.
- ⚠️ **The read must catch.** An async atom that rejects throws when read, and needs an error boundary in React.
- ℹ️ **Nothing runs until something subscribes**, which is Jotai's design: an atom no component reads costs nothing, and a fetch no component reads is never sent.

## Redux Toolkit

```tsx
export const createSearch = () => {
    const listener =
        createListenerMiddleware<Readonly<{ search: SliceState }>>();

    // Debounce: each keystroke cancels the run still waiting in `delay`.
    listener.startListening({
        actionCreator: queryChanged,
        effect: async (action, api) => {
            api.cancelActiveListeners();

            await api.delay(debounceMs); // rejects once this run is cancelled

            const q = action.payload.trim();

            if (q !== api.getState().search.debouncedQuery) {
                api.dispatch(queryDebounced(q));
            }
        },
    });

    // Fetch: a separate listener, so that a keystroke does not cancel a request;
    // only the next debounced query does, by aborting `signal`.
    listener.startListening({
        actionCreator: queryDebounced,
        effect: async (action, api) => {
            api.cancelActiveListeners();

            const q = action.payload;

            if (q === '') {
                api.dispatch(searchCleared());

                return;
            }

            api.dispatch(searchStarted(q));

            try {
                const items = await fetchItems(q, api.signal);

                // A cancelled run reports nothing, whether its request settled before
                // the abort or rejected because of it.
                if (!api.signal.aborted) {
                    api.dispatch(searchSucceeded({ query: q, items }));
                }
            } catch (error) {
                if (!api.signal.aborted) {
                    api.dispatch(
                        searchFailed({
                            query: q,
                            message: toErrorMessage(error),
                        }),
                    );
                }
            }
        },
    });

    const store = configureStore({
        reducer: { search: searchSlice.reducer },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().prepend(listener.middleware),
    });

    return {
        store,
        setQuery: (q: string) => {
            store.dispatch(queryChanged(q));
        },
        // Cancels every running listener: the timer and the request.
        dispose: () => {
            listener.clearListeners();
        },
    };
};

type SliceState = Readonly<{
    debouncedQuery: string;
    searchState: SearchState;
}>;

// Only the debounce listener reads it; no reducer does.
const queryChanged = createAction<string>('search/queryChanged');

const searchSlice = createSlice({
    name: 'search',
    initialState: {
        debouncedQuery: '',
        searchState: idleState,
    } satisfies SliceState,
    reducers: {
        queryDebounced: (state, action: Readonly<PayloadAction<string>>) => ({
            ...state,
            debouncedQuery: action.payload,
        }),
        searchCleared: (state) => ({ ...state, searchState: idleState }),
        searchStarted: (state, action: Readonly<PayloadAction<string>>) => ({
            ...state,
            searchState: { status: 'loading', query: action.payload },
        }),
        searchSucceeded: (
            state,
            action: Readonly<
                PayloadAction<
                    Readonly<{ query: string; items: readonly Item[] }>
                >
            >,
        ) => ({
            ...state,
            searchState: { status: 'success', ...action.payload },
        }),
        searchFailed: (
            state,
            action: Readonly<
                PayloadAction<Readonly<{ query: string; message: string }>>
            >,
        ) => ({
            ...state,
            searchState: { status: 'error', ...action.payload },
        }),
    },
});

const {
    queryDebounced,
    searchCleared,
    searchStarted,
    searchSucceeded,
    searchFailed,
} = searchSlice.actions;
```

- ✅ **The listener middleware is a small task runner**: `cancelActiveListeners()` cancels the previous run, which rejects its `delay()` and aborts its `signal`. Debounce and cancellation are both built from it.
- ⚠️ **It takes two listeners.** With one, every keystroke would abort the request in flight, and typing back to the query in flight would be deduplicated against a request that no longer exists, leaving `loading` on screen for good.
- ℹ️ **Every transition is an action**: six action types and a stored debounced query for one search box. In return, Redux DevTools shows each of them.
- ℹ️ **RTK Query** (`createApi`) caches and deduplicates requests per argument, but debouncing that argument is still the application's job. This page compares each library's own primitives, not data-fetching layers.

## Solid

```tsx
export const createSearch = () =>
    createRoot((dispose) => {
        const [query, setQuery] = createSignal('');

        // A signal ignores a write equal to its value, so a query that did not
        // change triggers nothing.
        const [debouncedQuery, setDebouncedQuery] = createSignal('');

        // There is no debounce; an effect whose cleanup clears the timer runs again
        // on every keystroke.
        createEffect(() => {
            const q = query().trim();

            const timer = setTimeout(() => setDebouncedQuery(q), debounceMs);

            onCleanup(() => {
                clearTimeout(timer);
            });
        });

        // createResource ignores a stale response but hands the fetcher no
        // AbortSignal. One controller per query, aborted by the cleanup that runs
        // when the query changes and when the root is disposed:
        const signal = createMemo(() => {
            debouncedQuery();

            const controller = new AbortController();

            onCleanup(() => {
                controller.abort();
            });

            return controller.signal;
        });

        // A `false` source fetches nothing (and keeps the last value).
        const [items] = createResource(
            () => {
                const q = debouncedQuery();

                return q !== '' && q;
            },
            (q) => fetchItems(q, signal()),
        );

        const searchState = createMemo((): SearchState => {
            const q = debouncedQuery();

            if (q === '') {
                return idleState;
            }

            // Reading an errored resource throws; ask for its state first.
            switch (items.state) {
                case 'errored':
                    return {
                        status: 'error',
                        query: q,
                        message: toErrorMessage(items.error),
                    };

                case 'ready':
                    return { status: 'success', query: q, items: items() };

                case 'unresolved':
                case 'pending':
                case 'refreshing':
                    return { status: 'loading', query: q };
            }
        });

        return { setQuery, searchState, dispose };
    });
```

- ✅ **`createResource` is Solid's async primitive** and covers the loading and error states and stale responses.
- ⚠️ **Everything around it is by hand**: the debounce, the `AbortController` the fetcher is not given, the blank query (a `false` source keeps the last value instead of clearing it), and the order of checks the resource's states need.
- ✅ **`onCleanup` makes teardown uniform**: `createRoot`'s `dispose()` runs every cleanup registered under it.

## Preact Signals

```tsx
export const createSearch = () => {
    const query = signal('');

    // A signal ignores a write equal to its value, so a query that did not change
    // triggers nothing.
    const debouncedQuery = signal('');

    const searchState = signal<SearchState>(idleState);

    // There is no debounce; an effect whose cleanup clears the timer runs again
    // on every keystroke.
    const disposeDebounce = effect(() => {
        const q = query.value.trim();

        const timer = setTimeout(() => {
            debouncedQuery.value = q;
        }, debounceMs);

        return () => {
            clearTimeout(timer);
        };
    });

    const disposeFetch = effect(() => {
        const q = debouncedQuery.value;

        if (q === '') {
            searchState.value = idleState;

            return undefined;
        }

        const controller = new AbortController();

        searchState.value = { status: 'loading', query: q };

        fetchItems(q, controller.signal)
            .then((items) => {
                if (!controller.signal.aborted) {
                    searchState.value = { status: 'success', query: q, items };
                }
            })
            .catch((error: unknown) => {
                // A replaced request rejects with an AbortError; it reports nothing.
                if (!controller.signal.aborted) {
                    searchState.value = {
                        status: 'error',
                        query: q,
                        message: toErrorMessage(error),
                    };
                }
            });

        // The cleanup runs before the next query's run, and on dispose.
        return () => {
            controller.abort();
        };
    });

    return {
        query,
        searchState,
        dispose: () => {
            disposeDebounce();

            disposeFetch();
        },
    };
};
```

- ✅ **The smallest API on this page**: `signal` and `effect`. An effect's returned cleanup runs before its next run and on dispose, which is enough for both the debounce and the abort.
- ⚠️ **Everything else is written by hand**: the loading state, the stale-response checks and the error state are writes to a signal from inside an effect.

## What the Comparison Shows

- **With the signal and store libraries, every requirement is code you write and must release**: a timer, an `AbortController`, a `signal.aborted` check, a state transition. Jotai's `signal`, Solid's `createResource` and Redux Toolkit's listener middleware each take one or two of them off your hands; none of them takes all.
- **With the two Observable libraries, each requirement is an operator**, and the next one is another line of the pipeline rather than another variable to keep in step.
- **Between those two, SynState's differences are the ones a UI depends on**: a current value without a `BehaviorSubject`, a pipeline that runs without a subscriber and is shared by every reader, errors as values so that no failure can end the pipeline, cancellation for any promise API through `fromAbortablePromise`, and glitch-free derived values.
- **What SynState costs** is the operator vocabulary itself, a new inner observable per query in `switchMap`, and `createScope` for a pipeline that has to be torn down before the page is.

How fast each library propagates an update is a separate question, which the [benchmark](/mono/synstate/guides/library-comparison/benchmark/) answers.
