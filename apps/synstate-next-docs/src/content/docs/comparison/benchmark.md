---
title: Benchmark
description: How long synstate-next takes to propagate updates, beside RxJS, MobX, Jotai, Redux, Solid, Preact Signals, Zustand and Valtio, in seven graph shapes.
---

This page times synstate-next and eight other state libraries on the same graphs: a single state, small derived graphs, a long chain, chained diamonds, a branch nobody reads, and a value that rarely changes under many readers. Each scenario asks one question about one shape of graph, so compare libraries within a scenario, not across scenarios.

## Summary

<!-- benchmark:summary -->

| Scenario                                             | Fastest                     | synstate-next ÷ fastest | Slowest | Slowest ÷ fastest | synstate-next ÷ synstate |
| :--------------------------------------------------- | :-------------------------- | ----------------------: | :------ | ----------------: | -----------------------: |
| [Single state](#single-state)                        | RxJS                        |                    1.7× | Jotai   |               42× |                     1.2× |
| [Derived chain](#derived-chain)                      | RxJS                        |                    2.1× | Jotai   |              102× |                     1.1× |
| [Diamond](#diamond)                                  | RxJS                        |                    1.1× | Jotai   |               60× |                     0.8× |
| [Deep chain](#deep-chain) (K=1000, M=200)            | Redux                       |                    2.3× | RxJS    |              200× |                     0.8× |
| [Cascaded diamond](#cascaded-diamond) (N=20)         | synstate-next               |                    1.0× | RxJS    |         > 19,082× |                     0.7× |
| [Conditional fan-out](#conditional-fan-out) (B=1000) | Solid                       |                    1.8× | Redux   |              210× |                     0.6× |
| [Unchanged value](#unchanged-value) (W=50)           | RxJS (distinctUntilChanged) |                    1.4× | Redux   |              527× |                     1.1× |

<!-- /benchmark -->

In no scenario does synstate-next take more than <!-- benchmark:subject-worst-over-fastest -->2.3×<!-- /benchmark --> as long as the fastest library there, while the slowest library in each takes at least <!-- benchmark:slowest-over-fastest-least -->42×<!-- /benchmark --> as long. A ratio marked `>` belongs to a library that did not finish within <!-- benchmark:timeout -->5,000<!-- /benchmark --> ms, counted as if it had taken exactly that long.

Read the other way round, the same figures give each library its worst case: the scenario where it is furthest from the fastest library, and how far.

<!-- benchmark:worst -->

| Library           | Scenario where it trails most                | Fastest there               | Library ÷ fastest |
| :---------------- | :------------------------------------------- | :-------------------------- | ----------------: |
| **synstate-next** | [Deep chain](#deep-chain) (K=1000, M=200)    | Redux                       |              2.3× |
| RxJS              | [Cascaded diamond](#cascaded-diamond) (N=20) | synstate-next               |         > 19,082× |
| MobX              | [Deep chain](#deep-chain) (K=1000, M=200)    | Redux                       |              122× |
| Jotai             | [Unchanged value](#unchanged-value) (W=50)   | RxJS (distinctUntilChanged) |              260× |
| Redux             | [Unchanged value](#unchanged-value) (W=50)   | RxJS (distinctUntilChanged) |              527× |
| Solid             | [Unchanged value](#unchanged-value) (W=50)   | RxJS (distinctUntilChanged) |               45× |
| Preact Signals    | [Unchanged value](#unchanged-value) (W=50)   | RxJS (distinctUntilChanged) |               18× |
| Zustand           | [Single state](#single-state)                | RxJS                        |              1.3× |
| Valtio            | [Single state](#single-state)                | RxJS                        |               11× |

<!-- /benchmark -->

synstate-next trails most in <!-- benchmark:subject-worst-scenario -->[Deep chain](#deep-chain) (K=1000, M=200)<!-- /benchmark -->; in its worst case, every other library measured in all seven scenarios takes at least <!-- benchmark:others-worst-least -->18×<!-- /benchmark --> as long as the fastest. Zustand and Valtio take part in the single state only (see [Keeping the comparison fair](#keeping-the-comparison-fair)), so their worst case is over that scenario alone. In the conditional fan-out, synstate-next and RxJS are counted in their `switchMap` form; the rows written naively are shown in that scenario but left out of this summary.

Every scenario also measures synstate, the library synstate-next is to replace, in the same run and from the same code as its own documentation's benchmark. Its rows show what the rewrite changed: the last column of the summary divides synstate-next's time by synstate's, where below 1.0× is faster. Being the same library's earlier generation, synstate is left out of the fastest, the slowest and the worst cases.

:::note[How these numbers are produced]
`pnpm --filter synstate-next-docs run benchmark` measures every scenario and rewrites the tables and figures on this page; the published figures come from the `synstate-next-benchmark.yml` workflow, which runs it on a GitHub-hosted runner, so that the ratios between libraries are those of the same kind of machine as synstate's documentation. Each library is measured <!-- benchmark:rounds -->7<!-- /benchmark --> times, each time in a Node.js process of its own, with every library in production mode. Where a sentence on this page no longer holds for a new measurement, the command stops and names it. The code is in [the documentation package](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-next-docs/scripts/benchmark).

<!-- benchmark:environment -->

|           |                                                                                                                                                          |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runner    | GitHub Actions (ubuntu24)                                                                                                                                |
| Node.js   | v26.13.0                                                                                                                                                 |
| OS        | Linux 7.0.0-1017-azure (x64)                                                                                                                             |
| CPU       | AMD EPYC 7763 64-Core Processor                                                                                                                          |
| Libraries | synstate 8.0.0, rxjs 7.8.2, mobx 7.1.0, jotai 3.0.1, @reduxjs/toolkit 2.13.0, solid-js 1.9.17, @preact/signals-core 1.14.4, zustand 5.0.15, valtio 2.3.2 |
| Measured  | 2026-11-12                                                                                                                                               |

<!-- /benchmark -->

Milliseconds are comparable only within one machine. To compare with your own measurement, compare the ratios between libraries.
:::

## Single state

One state, one subscriber, nothing derived: the floor every other scenario builds on, and the only scenario in which Zustand and Valtio take part. The state is written $N = 100{,}000$ times, and the subscriber records each value.

<!-- benchmark:results/single-state -->

| Library           | Median (ms) | p95 (ms) | Updates per second | ÷ synstate-next |
| :---------------- | ----------: | -------: | -----------------: | --------------: |
| **synstate-next** |        7.09 |     7.42 |         14,111,559 |            1.0× |
| synstate          |        5.68 |     6.65 |         17,618,812 |            0.8× |
| RxJS              |        4.26 |     4.45 |         23,476,140 |            0.6× |
| MobX              |        57.2 |     59.4 |          1,749,330 |            8.1× |
| Jotai             |         181 |      185 |            553,011 |             26× |
| Redux             |         118 |      123 |            845,495 |             17× |
| Solid             |        28.8 |     31.7 |          3,477,704 |            4.1× |
| Preact Signals    |        5.33 |     5.68 |         18,758,720 |            0.8× |
| Zustand           |        5.58 |     6.45 |         17,928,862 |            0.8× |
| Valtio            |        46.8 |     47.7 |          2,137,397 |            6.6× |

<!-- /benchmark -->

### Implementations

#### synstate-next

```ts
export const runBenchmark = (n: number): number => {
    const [counter, setCounter] = createState(0);

    let mut_lastValue = 0;

    const unsubscribe = counter.subscribe((v) => {
        mut_lastValue = v;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        setCounter(mut_i);
    }

    unsubscribe();

    return mut_lastValue;
};
```

#### RxJS

```ts
export const runBenchmark = (n: number): number => {
    const counter = new BehaviorSubject(0);

    let mut_lastValue = 0;

    const subscription = counter.subscribe((v) => {
        mut_lastValue = v;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        counter.next(mut_i);
    }

    subscription.unsubscribe();

    return mut_lastValue;
};
```

#### MobX

```ts
export const runBenchmark = (n: number): number => {
    const state = observable({ counter: 0 });

    let mut_lastValue = 0;

    const dispose = reaction(
        () => state.counter,
        (value) => {
            mut_lastValue = value;
        },
        { fireImmediately: true },
    );

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        runInAction(() => {
            state.counter = mut_i;
        });
    }

    dispose();

    return mut_lastValue;
};
```

#### Jotai

```ts
export const runBenchmark = (n: number): number => {
    const counterAtom = atom(0);

    const store = createStore();

    let mut_lastValue = store.get(counterAtom);

    const unsub = store.sub(counterAtom, () => {
        mut_lastValue = store.get(counterAtom);
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        store.set(counterAtom, mut_i);
    }

    unsub();

    return mut_lastValue;
};
```

#### Redux

```ts
export const runBenchmark = (n: number): number => {
    const counterSlice = createSlice({
        name: 'counter',
        initialState: { value: 0 },
        reducers: {
            set: (state, action: Readonly<{ payload: number }>) => {
                state.value = action.payload;
            },
        },
    });

    const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: () => new Tuple(),
    });

    let mut_lastValue = store.getState().value;

    store.subscribe(() => {
        mut_lastValue = store.getState().value;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        store.dispatch(counterSlice.actions.set(mut_i));
    }

    return mut_lastValue;
};
```

#### Solid

```ts
export const runBenchmark = (n: number): number => {
    let mut_lastValue = 0;

    const { setCounter, dispose } = createRoot((disposeRoot) => {
        const [counter, setCounterValue] = createSignal(0);

        createEffect(() => {
            mut_lastValue = counter();
        });

        return { setCounter: setCounterValue, dispose: disposeRoot };
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        setCounter(mut_i);
    }

    dispose();

    return mut_lastValue;
};
```

#### Preact Signals

```ts
export const runBenchmark = (n: number): number => {
    const counter = signal(0);

    let mut_lastValue = 0;

    const dispose = effect(() => {
        mut_lastValue = counter.value;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        counter.value = mut_i;
    }

    dispose();

    return mut_lastValue;
};
```

#### Zustand

```ts
export const runBenchmark = (n: number): number => {
    const store = createStore<Readonly<{ counter: number }>>()(() => ({
        counter: 0,
    }));

    let mut_lastValue = store.getState().counter;

    store.subscribe((state) => {
        mut_lastValue = state.counter;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        store.setState({ counter: mut_i });
    }

    return mut_lastValue;
};
```

#### Valtio

```ts
export const runBenchmark = (n: number): number => {
    const state = proxy({ counter: 0 });

    let mut_lastValue = state.counter;

    const unsubscribe = subscribe(
        state,
        () => {
            mut_lastValue = state.counter;
        },
        true,
    );

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        state.counter = mut_i;
    }

    unsubscribe();

    return mut_lastValue;
};
```

## Derived chain

The state is doubled, and the result doubled again, with one subscriber at the end: two derived values in a row, written $N = 100{,}000$ times.

<!-- benchmark:results/derived-chain -->

| Library           | Median (ms) | p95 (ms) | Updates per second | ÷ synstate-next |
| :---------------- | ----------: | -------: | -----------------: | --------------: |
| **synstate-next** |        15.8 |     18.1 |          6,346,503 |            1.0× |
| synstate          |        15.0 |     17.2 |          6,667,307 |            1.0× |
| RxJS              |        7.33 |     7.68 |         13,644,575 |            0.5× |
| MobX              |         111 |      113 |            900,280 |            7.0× |
| Jotai             |         749 |      769 |            133,526 |             48× |
| Redux             |         289 |      304 |            345,779 |             18× |
| Solid             |        87.5 |     89.4 |          1,143,379 |            5.6× |
| Preact Signals    |        15.0 |     17.2 |          6,665,744 |            1.0× |

<!-- /benchmark -->

### Implementations

#### synstate-next

```ts
export const runBenchmark = (n: number): number => {
    const [counter, setCounter] = createState(0);

    const doubled = counter.pipe(map((x) => x * 2));

    const quadrupled = doubled.pipe(map((x) => x * 2));

    let mut_lastValue = 0;

    const unsubscribe = quadrupled.subscribe((v) => {
        mut_lastValue = v;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        setCounter(mut_i);
    }

    unsubscribe();

    return mut_lastValue;
};
```

#### RxJS

```ts
export const runBenchmark = (n: number): number => {
    const counter = new BehaviorSubject(0);

    const doubled = counter.pipe(map((x) => x * 2));

    const quadrupled = doubled.pipe(map((x) => x * 2));

    let mut_lastValue = 0;

    const subscription = quadrupled.subscribe((v) => {
        mut_lastValue = v;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        counter.next(mut_i);
    }

    subscription.unsubscribe();

    return mut_lastValue;
};
```

#### MobX

```ts
export const runBenchmark = (n: number): number => {
    const state = observable({ counter: 0 });

    const doubled = computed(() => state.counter * 2);

    const quadrupled = computed(() => doubled.get() * 2);

    let mut_lastValue = 0;

    const dispose = reaction(
        () => quadrupled.get(),
        (value) => {
            mut_lastValue = value;
        },
        { fireImmediately: true },
    );

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        runInAction(() => {
            state.counter = mut_i;
        });
    }

    dispose();

    return mut_lastValue;
};
```

#### Jotai

```ts
export const runBenchmark = (n: number): number => {
    const counterAtom = atom(0);

    const doubledAtom = atom((get) => get(counterAtom) * 2);

    const quadrupledAtom = atom((get) => get(doubledAtom) * 2);

    const store = createStore();

    let mut_lastValue = store.get(quadrupledAtom);

    const unsub = store.sub(quadrupledAtom, () => {
        mut_lastValue = store.get(quadrupledAtom);
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        store.set(counterAtom, mut_i);
    }

    unsub();

    return mut_lastValue;
};
```

#### Redux

```ts
export const runBenchmark = (n: number): number => {
    const counterSlice = createSlice({
        name: 'counter',
        initialState: { value: 0 },
        reducers: {
            set: (state, action: Readonly<{ payload: number }>) => {
                state.value = action.payload;
            },
        },
    });

    const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: () => new Tuple(),
    });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const selectCounter = (state: Readonly<{ value: number }>): number =>
        state.value;

    // `lruMemoize`, not the default `weakMapMemoize`. Every input here is a new
    // number that never repeats, and `weakMapMemoize` keeps every distinct
    // primitive it has seen: one round would cache 100,000 results it never hits,
    // and that memory and GC would be measured as Redux's cost.
    const selectDoubled = createSelector(
        selectCounter,
        (counter) => counter * 2,
        { memoize: lruMemoize },
    );

    const selectQuadrupled = createSelector(
        selectDoubled,
        (doubled) => doubled * 2,
        { memoize: lruMemoize },
    );

    let mut_lastValue = selectQuadrupled(store.getState());

    store.subscribe(() => {
        mut_lastValue = selectQuadrupled(store.getState());
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        store.dispatch(counterSlice.actions.set(mut_i));
    }

    return mut_lastValue;
};
```

#### Solid

```ts
export const runBenchmark = (n: number): number => {
    let mut_lastValue = 0;

    const { setCounter, dispose } = createRoot((disposeRoot) => {
        const [counter, setCounterValue] = createSignal(0);

        const doubled = createMemo(() => counter() * 2);

        const quadrupled = createMemo(() => doubled() * 2);

        createEffect(() => {
            mut_lastValue = quadrupled();
        });

        return { setCounter: setCounterValue, dispose: disposeRoot };
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        setCounter(mut_i);
    }

    dispose();

    return mut_lastValue;
};
```

#### Preact Signals

```ts
export const runBenchmark = (n: number): number => {
    const counter = signal(0);

    const doubled = computed(() => counter.value * 2);

    const quadrupled = computed(() => doubled.value * 2);

    let mut_lastValue = 0;

    const dispose = effect(() => {
        mut_lastValue = quadrupled.value;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        counter.value = mut_i;
    }

    dispose();

    return mut_lastValue;
};
```

## Diamond

The state is doubled and tripled, and the two are added: two paths from one state meet again. A glitch-free library calls the subscriber once per write, with both sides up to date. The state is written $N = 100{,}000$ times.

<!-- benchmark:results/diamond -->

| Library           | Median (ms) | p95 (ms) | Updates per second | ÷ synstate-next |
| :---------------- | ----------: | -------: | -----------------: | --------------: |
| **synstate-next** |        21.2 |     22.1 |          4,727,067 |            1.0× |
| synstate          |        25.4 |     31.5 |          3,941,890 |            1.2× |
| RxJS              |        18.4 |     19.0 |          5,429,040 |            0.9× |
| MobX              |         143 |      146 |            698,530 |            6.8× |
| Jotai             |       1,106 |    1,121 |             90,424 |             52× |
| Redux             |         362 |      384 |            276,237 |             17× |
| Solid             |         108 |      115 |            923,381 |            5.1× |
| Preact Signals    |        22.3 |     23.9 |          4,479,429 |            1.1× |

<!-- /benchmark -->

### What the first three scenarios show

On these small graphs the time is mostly what a library does for each write, and synstate-next takes at most <!-- benchmark:small-graphs-subject-over-fastest-max -->2.1×<!-- /benchmark --> as long as the fastest library in each. The fastest do less per write. RxJS passes each value straight on to the next `subscribe`, with no step that orders the update, which is also why its subscriber sees a mix of an old and a new value in the diamond. Preact Signals computes a value only when something reads it. synstate-next computes every value a write reaches, parents before children, before it calls any subscriber, so that each subscriber sees every value up to date and is called once. Solid, MobX, Jotai and Redux take longer than synstate-next in all three.

### Implementations

#### synstate-next

```ts
export const runBenchmark = (n: number): number => {
    const [counter, setCounter] = createState(0);

    const doubled = counter.pipe(map((x) => x * 2));

    const tripled = counter.pipe(map((x) => x * 3));

    const sum = derive([doubled, tripled], (d, t) => d + t);

    let mut_lastValue = 0;

    const unsubscribe = sum.subscribe((v) => {
        mut_lastValue = v;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        setCounter(mut_i);
    }

    unsubscribe();

    return mut_lastValue;
};
```

#### RxJS

```ts
export const runBenchmark = (n: number): number => {
    const counter = new BehaviorSubject(0);

    const doubled = counter.pipe(map((x) => x * 2));

    const tripled = counter.pipe(map((x) => x * 3));

    const sum = combineLatest([doubled, tripled]).pipe(map(([d, t]) => d + t));

    let mut_lastValue = 0;

    const subscription = sum.subscribe((v) => {
        mut_lastValue = v;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        counter.next(mut_i);
    }

    subscription.unsubscribe();

    return mut_lastValue;
};
```

#### MobX

```ts
export const runBenchmark = (n: number): number => {
    const state = observable({ counter: 0 });

    const doubled = computed(() => state.counter * 2);

    const tripled = computed(() => state.counter * 3);

    const sum = computed(() => doubled.get() + tripled.get());

    let mut_lastValue = 0;

    const dispose = reaction(
        () => sum.get(),
        (value) => {
            mut_lastValue = value;
        },
        { fireImmediately: true },
    );

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        runInAction(() => {
            state.counter = mut_i;
        });
    }

    dispose();

    return mut_lastValue;
};
```

#### Jotai

```ts
export const runBenchmark = (n: number): number => {
    const counterAtom = atom(0);

    const doubledAtom = atom((get) => get(counterAtom) * 2);

    const tripledAtom = atom((get) => get(counterAtom) * 3);

    const sumAtom = atom((get) => get(doubledAtom) + get(tripledAtom));

    const store = createStore();

    let mut_lastValue = store.get(sumAtom);

    const unsub = store.sub(sumAtom, () => {
        mut_lastValue = store.get(sumAtom);
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        store.set(counterAtom, mut_i);
    }

    unsub();

    return mut_lastValue;
};
```

#### Redux

```ts
export const runBenchmark = (n: number): number => {
    const counterSlice = createSlice({
        name: 'counter',
        initialState: { value: 0 },
        reducers: {
            set: (state, action: Readonly<{ payload: number }>) => {
                state.value = action.payload;
            },
        },
    });

    const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: () => new Tuple(),
    });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const selectCounter = (state: Readonly<{ value: number }>): number =>
        state.value;

    // `lruMemoize`, not the default `weakMapMemoize`. Every input here is a new
    // number that never repeats, and `weakMapMemoize` keeps every distinct
    // primitive it has seen: one round would cache 100,000 results it never hits,
    // and that memory and GC would be measured as Redux's cost.
    const selectDoubled = createSelector(
        selectCounter,
        (counter) => counter * 2,
        { memoize: lruMemoize },
    );

    const selectTripled = createSelector(
        selectCounter,
        (counter) => counter * 3,
        { memoize: lruMemoize },
    );

    const selectSum = createSelector(
        selectDoubled,
        selectTripled,
        (doubled, tripled) => doubled + tripled,
        { memoize: lruMemoize },
    );

    let mut_lastValue = selectSum(store.getState());

    store.subscribe(() => {
        mut_lastValue = selectSum(store.getState());
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        store.dispatch(counterSlice.actions.set(mut_i));
    }

    return mut_lastValue;
};
```

#### Solid

```ts
export const runBenchmark = (n: number): number => {
    let mut_lastValue = 0;

    const { setCounter, dispose } = createRoot((disposeRoot) => {
        const [counter, setCounterValue] = createSignal(0);

        const doubled = createMemo(() => counter() * 2);

        const tripled = createMemo(() => counter() * 3);

        const sum = createMemo(() => doubled() + tripled());

        createEffect(() => {
            mut_lastValue = sum();
        });

        return { setCounter: setCounterValue, dispose: disposeRoot };
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        setCounter(mut_i);
    }

    dispose();

    return mut_lastValue;
};
```

#### Preact Signals

```ts
export const runBenchmark = (n: number): number => {
    const counter = signal(0);

    const doubled = computed(() => counter.value * 2);

    const tripled = computed(() => counter.value * 3);

    const sum = computed(() => doubled.value + tripled.value);

    let mut_lastValue = 0;

    const dispose = effect(() => {
        mut_lastValue = sum.value;
    });

    for (let mut_i = 1; mut_i <= n; mut_i++) {
        counter.value = mut_i;
    }

    dispose();

    return mut_lastValue;
};
```

## Deep chain

A head point followed by $M$ stages, each moving a small step towards the stage before it whenever the head moves, as a trail follows a pointer. One subscriber receives all $M + 1$ points. The graph is built once, outside the timing, and the head is moved $K$ times.

<!-- benchmark:results/deep-chain -->

| Library           | K=100, M=50 (ms) | K=500, M=50 (ms) | K=1000, M=50 (ms) | K=100, M=100 (ms) | K=500, M=100 (ms) | K=1000, M=100 (ms) | K=500, M=200 (ms) | K=1000, M=200 (ms) |
| :---------------- | ---------------: | ---------------: | ----------------: | ----------------: | ----------------: | -----------------: | ----------------: | -----------------: |
| **synstate-next** |             0.96 |             1.80 |              3.31 |              0.55 |              2.99 |               5.89 |              5.85 |               11.9 |
| synstate          |             1.42 |             3.39 |              3.66 |              0.66 |              3.74 |               7.48 |              7.17 |               14.4 |
| RxJS              |             7.61 |             30.6 |              56.3 |              22.5 |               130 |                238 |               508 |              1,031 |
| MobX              |             16.8 |             79.6 |               158 |              31.8 |               157 |                317 |               314 |                628 |
| Jotai             |             23.5 |             99.5 |               198 |              39.3 |               197 |                395 |               404 |                802 |
| Redux             |             0.71 |             3.16 |              4.64 |              0.76 |              4.25 |               5.61 |              7.35 |               5.15 |
| Solid             |             3.48 |             6.52 |              12.8 |              2.45 |              12.4 |               28.4 |              27.9 |               55.3 |
| Preact Signals    |             1.63 |             1.60 |              2.96 |              0.50 |              2.46 |               8.54 |              8.28 |               17.2 |

<!-- /benchmark -->

### What the results show

When the chain gets four times deeper ($M = 50 \to 200$ at $K = 1000$), synstate-next takes <!-- benchmark:deep-chain-subject-growth -->3.6×<!-- /benchmark --> as long and RxJS <!-- benchmark:deep-chain-rxjs-growth -->18×<!-- /benchmark -->. Of all the libraries, RxJS's time grows the most as the chain gets deeper. synstate-next computes each stage once per move and calls the subscriber once. RxJS's `combineLatest` emits each time one of its $M + 1$ inputs moves, so its subscriber is called $M + 1$ times per move, each time with $M + 1$ points. Redux, MobX and Preact Signals advance the whole chain in one loop inside a reducer, reaction or effect, so their rows time a loop rather than a chain of derived values (see [Keeping the comparison fair](#keeping-the-comparison-fair)).

### Implementation

```ts
type Point = Readonly<{ x: number; y: number }>;

/**
 * The deep chain: a head point followed by `chainDepth` stages, each moving a
 * small step towards the stage before it whenever the head moves. The
 * subscriber receives every point after each move.
 */
export const createSynStateNextThroughputAdapter = (): ThroughputAdapter => {
    let mut_setHead: ((pos: Point) => void) | undefined;

    let mut_unsubscribe: Unsubscribe | undefined;

    return {
        name: 'synstate-next',
        setup: (chainDepth, { onEmit }) => {
            const startPos: Point = {
                x: CANVAS_WIDTH / 2,
                y: CANVAS_HEIGHT / 2,
            } as const;

            const [head, setHead] = createState(startPos);

            mut_setHead = setHead;

            const mut_stages: InitializedObservable<Point>[] = [];

            let mut_prev: InitializedObservable<Point> = head;

            for (const _ of range(0, chainDepth)) {
                const stage = mut_prev.pipe(
                    scan(
                        (acc: Point, target: Point) =>
                            stepTowards(acc, target, SPRING_FACTOR),
                        startPos,
                    ),
                );

                mut_stages.push(stage);

                mut_prev = stage;
            }

            mut_unsubscribe = derive(
                Arr.toUnshifted(head)(mut_stages),
                (...points) => points,
            ).subscribe(onEmit);
        },
        onMouseMove: (pos) => {
            mut_setHead?.(pos);
        },
        cleanup: () => {
            mut_unsubscribe?.();

            mut_unsubscribe = undefined;

            mut_setHead = undefined;
        },
    };
};

/** The shape of the adapters the deep chain runner drives. */
export type ThroughputAdapter = Readonly<{
    name: string;
    setup: (
        chainDepth: SafeUint,
        callbacks: Readonly<{ onEmit: (points: readonly Point[]) => void }>,
    ) => void;
    onMouseMove: (pos: Point) => void;
    cleanup: () => void;
}>;

// The canvas and spring of synstate's throughput demo, whose adapters for the
// other libraries are timed beside this one.
const CANVAS_WIDTH = 500;

const CANVAS_HEIGHT = 400;

const SPRING_FACTOR = 0.003;

const stepTowards = (current: Point, target: Point, factor: number): Point =>
    ({
        x: current.x + (target.x - current.x) * factor,
        y: current.y + (target.y - current.y) * factor,
    }) as const;
```

The other libraries' code is that of [synstate's throughput demo](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-docs/src/components/throughput-demo/adapters).

## Cascaded diamond

$N$ diamonds in a row: each splits the value before it in two and adds the two back together. There are $2^N$ paths from the state to the subscriber, and $3N$ derived values. Each run builds the graph and writes the state $K = 100$ times.

<!-- benchmark:results/cascaded-diamond -->

| Library           | N=2 (ms) | N=4 (ms) | N=6 (ms) | N=8 (ms) | N=10 (ms) | N=12 (ms) | N=14 (ms) | N=16 (ms) | N=18 (ms) | N=20 (ms) |
| :---------------- | -------: | -------: | -------: | -------: | --------: | --------: | --------: | --------: | --------: | --------: |
| **synstate-next** |     0.23 |     0.17 |     0.40 |     0.34 |      0.36 |      0.19 |      0.19 |      0.23 |      0.26 |      0.26 |
| synstate          |     0.42 |     0.22 |     0.58 |     0.78 |      0.89 |      0.53 |      0.30 |      0.35 |      0.38 |      0.40 |
| RxJS              |     0.23 |     1.39 |     3.80 |     25.8 |       132 |       702 |   > 5,000 |   > 5,000 |   > 5,000 |   > 5,000 |
| MobX              |     0.88 |     1.74 |     1.18 |     0.98 |      0.78 |      0.89 |      1.00 |      1.12 |      1.24 |      1.39 |
| Jotai             |     4.23 |     5.15 |     7.58 |     9.23 |      12.4 |      10.1 |      11.7 |      13.4 |      19.2 |      21.1 |
| Redux             |     1.75 |     1.18 |     1.38 |     1.80 |      1.97 |      3.09 |      2.72 |      3.08 |      3.38 |      3.80 |
| Solid             |     0.52 |     0.73 |     1.65 |     1.41 |      1.14 |      0.84 |      0.96 |      1.09 |      1.23 |      1.36 |
| Preact Signals    |     0.16 |     0.25 |     0.37 |     0.46 |      0.45 |      0.44 |      0.37 |      0.28 |      0.33 |      0.36 |

<!-- /benchmark -->

### What the results show

synstate-next's time stays flat as $N$ grows. A write computes each of the $3N$ derived values once and calls the subscriber once, however many paths lead to it, and a new value takes its place from its direct parents alone, so building the graph never walks the $2^N$ paths. RxJS's subscriber is called once per path, and from <!-- benchmark:cascaded-rxjs-timeout -->$N = 14$<!-- /benchmark --> it does not finish within the timeout.

### Implementation

```ts
export const runBenchmark = (k: number, depth: number): number => {
    const [source, setSource] = createState(0);

    let mut_current = source;

    for (const _i of range(0, asSafeUint(depth))) {
        const prev = mut_current;

        const left = prev.pipe(map((x) => x + 1));

        const right = prev.pipe(map((x) => x + 2));

        mut_current = derive([left, right], (l, r) => l + r);
    }

    let mut_lastValue = 0;

    const unsubscribe = mut_current.subscribe((v) => {
        mut_lastValue = v;
    });

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        setSource(mut_i);
    }

    unsubscribe();

    return mut_lastValue;
};
```

The other libraries' code is in [synstate's samples](https://github.com/noshiro-pf/mono/tree/main/libs/synstate/samples/docs-site/benchmark), as `04-cascaded-diamond.*.mts`.

## Conditional fan-out

$B$ branches and a selector that picks one of them; the result is the picked branch's value. The selector stays at branch 0, and branch 1, which nobody reads, is written $K = 100{,}000$ times.

<!-- benchmark:results/conditional-fan-out -->

| Library                          | B=2 (ms) | B=5 (ms) | B=10 (ms) | B=20 (ms) | B=50 (ms) | B=100 (ms) | B=200 (ms) | B=500 (ms) | B=1000 (ms) |
| :------------------------------- | -------: | -------: | --------: | --------: | --------: | ---------: | ---------: | ---------: | ----------: |
| **synstate-next (switchMap)**    |     1.22 |     1.19 |      1.13 |      1.14 |      1.21 |       1.15 |       1.18 |       1.24 |        1.42 |
| **synstate-next (naive derive)** |     11.8 |     13.0 |      14.9 |      18.2 |      29.9 |       47.3 |       84.2 |        198 |         380 |
| synstate (switchMap)             |     2.43 |     2.11 |      1.86 |      1.78 |      1.81 |       1.84 |       1.95 |       2.36 |        2.46 |
| synstate (naive derive)          |     11.0 |     11.7 |      14.5 |      20.2 |      38.5 |       69.1 |        134 |        321 |         673 |
| RxJS (switchMap)                 |     3.33 |     2.92 |      2.88 |      2.86 |      2.92 |       2.91 |       2.94 |       3.07 |        3.24 |
| RxJS (naive combineLatest)       |     8.50 |     8.52 |      9.07 |      8.98 |      10.0 |       11.0 |       16.2 |       30.0 |        57.7 |
| MobX                             |     1.55 |     1.49 |      1.44 |      1.43 |      1.44 |       1.43 |       1.44 |       1.46 |        1.51 |
| Jotai                            |      139 |      139 |       139 |       139 |       139 |        139 |        139 |        139 |         138 |
| Redux                            |      113 |      112 |       115 |       114 |       116 |        124 |        125 |        145 |         170 |
| Solid                            |     0.79 |     1.00 |      0.74 |      0.74 |      0.74 |       0.75 |       0.77 |       0.85 |        0.81 |
| Preact Signals                   |     1.09 |     1.06 |      0.97 |      1.03 |      1.05 |       1.00 |       1.00 |       1.15 |        1.35 |

<!-- /benchmark -->

### What the results show

Written with `switchMap`, synstate-next's time does not grow with $B$. `switchMap` follows the picked branch only, so a write to branch 1 reaches nothing, and the time stays between <!-- benchmark:fan-out-switch-map-range -->1.13–1.42<!-- /benchmark --> ms at every $B$, as it does for MobX, Solid and Preact Signals, which follow only what was read. Written naively, with a `derive` over every branch, each write computes the `derive` again from all $B$ values, and at <!-- benchmark:fan-out-summary-point -->$B = 1000$<!-- /benchmark --> that takes <!-- benchmark:fan-out-naive-over-fastest -->472×<!-- /benchmark --> as long as the fastest library. The scenario never changes the selector, so it does not time switching branches.

### Implementations

#### synstate-next (`switchMap`)

```ts
export const runBenchmark = (k: number, branchCount: number): number => {
    const [selector] = createState(0);

    const branches: DeepReadonly<
        {
            source: Observable<number>;
            set: (v: number) => void;
        }[]
    > = Arr.zeros(asUint32(branchCount)).map(() => {
        const [source, setSource] = createState(0);

        return { source, set: setSource };
    });

    // Follows only the branch the selector picks.
    const result = selector.pipe(
        switchMap((sel) => branches[sel]?.source ?? just(0)),
    );

    let mut_lastValue = 0;

    const unsubscribe = result.subscribe((v) => {
        mut_lastValue = v;
    });

    // Update a branch the selector does not pick (branch 1, while it picks 0).
    const inactiveBranch = branches[1];

    if (inactiveBranch === undefined) {
        throw new Error('need at least 2 branches');
    }

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        inactiveBranch.set(mut_i);
    }

    unsubscribe();

    return mut_lastValue;
};
```

#### synstate-next (naive `derive`)

```ts
export const runBenchmark = (k: number, branchCount: number): number => {
    const [selector] = createState(0);

    const branches: DeepReadonly<
        {
            source: Observable<number>;
            set: (v: number) => void;
        }[]
    > = Arr.zeros(asUint32(branchCount)).map(() => {
        const [source, setSource] = createState(0);

        return { source, set: setSource };
    });

    // Every branch is a parent, so every write to one recomputes this.
    const result = derive(
        // `derive` passes the values as a tuple only when given an array literal.
        // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing
        [selector, ...branches.map((b) => b.source)],
        (selectorValue, ...branchValues) => branchValues[selectorValue] ?? 0,
    );

    let mut_lastValue = 0;

    const unsubscribe = result.subscribe((v) => {
        mut_lastValue = v;
    });

    // Update a branch the selector does not pick (branch 1, while it picks 0).
    const inactiveBranch = branches[1];

    if (inactiveBranch === undefined) {
        throw new Error('need at least 2 branches');
    }

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        inactiveBranch.set(mut_i);
    }

    unsubscribe();

    return mut_lastValue;
};
```

#### RxJS (`switchMap`)

```ts
export const runBenchmark = (k: number, branchCount: number): number => {
    const selector = new BehaviorSubject(0);

    const branches: readonly BehaviorSubject<number>[] = Arr.zeros(
        asUint32(branchCount),
    ).map(() => new BehaviorSubject(0));

    // Dynamic dependency: only follows the branch selected by selector
    const result = selector.pipe(switchMap((sel) => branches[sel] ?? of(0)));

    let mut_lastValue = 0;

    const subscription = result.subscribe((v) => {
        mut_lastValue = v;
    });

    // Update an INACTIVE branch (branch 1, while selector = 0)
    const inactiveBranch = branches[1];

    if (inactiveBranch === undefined) {
        throw new Error('need at least 2 branches');
    }

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        inactiveBranch.next(mut_i);
    }

    subscription.unsubscribe();

    return mut_lastValue;
};
```

#### RxJS (naive `combineLatest`)

```ts
export const runBenchmark = (k: number, branchCount: number): number => {
    const selector = new BehaviorSubject(0);

    const branches: readonly BehaviorSubject<number>[] = Arr.zeros(
        asUint32(branchCount),
    ).map(() => new BehaviorSubject(0));

    // `combineLatest` only infers the element types from an array literal.
    // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing
    const result = combineLatest([selector, ...branches]).pipe(
        map((values) => {
            const sel = values[0];

            return values[sel + 1] ?? 0;
        }),
    );

    let mut_lastValue = 0;

    const subscription = result.subscribe((v) => {
        mut_lastValue = v;
    });

    // Update an INACTIVE branch (branch 1, while selector = 0)
    const inactiveBranch = branches[1];

    if (inactiveBranch === undefined) {
        throw new Error('need at least 2 branches');
    }

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        inactiveBranch.next(mut_i);
    }

    subscription.unsubscribe();

    return mut_lastValue;
};
```

#### MobX

```ts
export const runBenchmark = (k: number, branchCount: number): number => {
    const selector = observable.box(0);

    const branches: readonly ReturnType<typeof observable.box<number>>[] =
        Arr.zeros(asUint32(branchCount)).map(() => observable.box(0));

    // Dynamic dependency: only tracks the branch selected by selector
    const result = computed(() => {
        const sel = selector.get();

        const target = branches[sel];

        return target === undefined ? 0 : target.get();
    });

    let mut_lastValue = 0;

    const dispose = reaction(
        () => result.get(),
        (value) => {
            mut_lastValue = value ?? 0;
        },
        { fireImmediately: true },
    );

    // Update an INACTIVE branch (branch 1, while selector = 0)
    const inactiveBranch = branches[1];

    if (inactiveBranch === undefined) {
        throw new Error('need at least 2 branches');
    }

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        inactiveBranch.set(mut_i);
    }

    dispose();

    return mut_lastValue;
};
```

#### Jotai

```ts
export const runBenchmark = (k: number, branchCount: number): number => {
    const selectorAtom = atom(0);

    const branchAtoms: readonly WritableAtom<
        number,
        Mutable<readonly [number]>,
        void
    >[] = Arr.zeros(asUint32(branchCount)).map(() => atom(0));

    // Dynamic dependency: only reads the branch selected by selectorAtom
    const resultAtom = atom((get) => {
        const sel = get(selectorAtom);

        const targetAtom = branchAtoms[sel];

        return targetAtom === undefined ? 0 : get(targetAtom);
    });

    const store = createStore();

    let mut_lastValue = store.get(resultAtom);

    const unsub = store.sub(resultAtom, () => {
        mut_lastValue = store.get(resultAtom);
    });

    // Update an INACTIVE branch (branch 1, while selector = 0)
    const inactiveBranchAtom = branchAtoms[1];

    if (inactiveBranchAtom === undefined) {
        throw new Error('need at least 2 branches');
    }

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        store.set(inactiveBranchAtom, mut_i);
    }

    unsub();

    return mut_lastValue;
};
```

#### Redux

```ts
export const runBenchmark = (k: number, branchCount: number): number => {
    type State = Readonly<{
        selector: number;
        branches: readonly number[];
    }>;

    const setBranch =
        createAction<Readonly<{ index: number; value: number }>>(
            'fanOut/setBranch',
        );

    const isSetBranch = isAnyOf(setBranch);

    const initialState: State = {
        selector: 0,
        branches: Arr.zeros(asUint32(branchCount)),
    } as const;

    // A plain reducer rather than `createSlice`: an Immer draft of the `branches`
    // array would be finalized element by element on every update, and that would
    // be measured as Redux's cost.
    const store = configureStore({
        reducer: (
            state: State | undefined,
            action: Readonly<UnknownAction>,
        ): State => {
            const current = state ?? initialState;

            return isSetBranch(action)
                ? {
                      ...current,
                      branches: current.branches.with(
                          action.payload.index,
                          action.payload.value,
                      ),
                  }
                : current;
        },
        middleware: () => new Tuple(),
    });

    // Reads only the branch the selector picks. Every update replaces the
    // `branches` array, so this recomputes on each one — an index lookup.
    const selectResult = createSelector(
        (state: State) => state.selector,
        (state: State) => state.branches,
        (sel, branches) => branches[sel] ?? 0,
        { memoize: lruMemoize },
    );

    let mut_lastValue = selectResult(store.getState());

    store.subscribe(() => {
        mut_lastValue = selectResult(store.getState());
    });

    // Update an INACTIVE branch (branch 1, while selector = 0)
    for (let mut_i = 1; mut_i <= k; mut_i++) {
        store.dispatch(setBranch({ index: 1, value: mut_i }));
    }

    return mut_lastValue;
};
```

#### Solid

```ts
export const runBenchmark = (k: number, branchCount: number): number => {
    let mut_lastValue = 0;

    const { branches, dispose } = createRoot((disposeRoot) => {
        const [selector] = createSignal(0);

        const branchSignals: readonly Signal<number>[] = Arr.zeros(
            asUint32(branchCount),
        ).map(() => createSignal(0));

        // Dynamic dependency: only tracks the branch selected by selector
        const result = createMemo(() => {
            const target = branchSignals[selector()];

            return target === undefined ? 0 : target[0]();
        });

        createEffect(() => {
            mut_lastValue = result();
        });

        return { branches: branchSignals, dispose: disposeRoot };
    });

    // Update an INACTIVE branch (branch 1, while selector = 0)
    const inactiveBranch = branches[1];

    if (inactiveBranch === undefined) {
        throw new Error('need at least 2 branches');
    }

    const [, setInactiveBranch] = inactiveBranch;

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        setInactiveBranch(mut_i);
    }

    dispose();

    return mut_lastValue;
};
```

#### Preact Signals

```ts
export const runBenchmark = (k: number, branchCount: number): number => {
    const selector = signal(0);

    const branches: readonly Signal<number>[] = Arr.zeros(
        asUint32(branchCount),
    ).map(() => signal(0));

    // Dynamic dependency: only tracks the branch selected by selector
    const result = computed(() => {
        const target = branches[selector.value];

        return target === undefined ? 0 : target.value;
    });

    let mut_lastValue = 0;

    const dispose = effect(() => {
        mut_lastValue = result.value;
    });

    // Update an INACTIVE branch (branch 1, while selector = 0)
    const inactiveBranch = branches[1];

    if (inactiveBranch === undefined) {
        throw new Error('need at least 2 branches');
    }

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        inactiveBranch.value = mut_i;
    }

    dispose();

    return mut_lastValue;
};
```

## Unchanged value

One state, a `bucket` computed from it that changes on one write in 1000, and $W$ views below the bucket, each with a subscriber of its own: many readers of one value that rarely changes, as many components read an "is the list empty" flag under a list that changes on every keystroke. The state is written $K = 100{,}000$ times.

<!-- benchmark:results/unchanged-value -->

| Library                               | W=1 (ms) | W=2 (ms) | W=5 (ms) | W=10 (ms) | W=20 (ms) | W=50 (ms) | W=100 (ms) | W=200 (ms) | W=500 (ms) | W=1000 (ms) |
| :------------------------------------ | -------: | -------: | -------: | --------: | --------: | --------: | ---------: | ---------: | ---------: | ----------: |
| **synstate-next**                     |     10.5 |     10.6 |     10.4 |      10.2 |      10.3 |      10.5 |       10.8 |       11.4 |       13.8 |        19.9 |
| synstate                              |     9.02 |     9.19 |     8.86 |      8.85 |      9.16 |      9.32 |       9.53 |       9.99 |       12.3 |        17.0 |
| RxJS (distinctUntilChanged)           |     7.58 |     7.41 |     7.24 |      7.31 |      7.27 |      7.64 |       7.83 |       8.64 |       10.8 |        15.2 |
| RxJS (naive, no distinctUntilChanged) |     17.6 |     19.7 |     30.5 |      49.0 |      91.2 |       181 |        345 |        680 |      1,885 |       4,017 |
| MobX                                  |     68.4 |     78.8 |      112 |       168 |       288 |       619 |      1,167 |      2,265 |    > 5,000 |     > 5,000 |
| Jotai                                 |      457 |      506 |      573 |       714 |     1,001 |     1,989 |      3,684 |    > 5,000 |    > 5,000 |     > 5,000 |
| Redux                                 |      284 |      361 |      565 |       932 |     1,746 |     4,024 |    > 5,000 |    > 5,000 |    > 5,000 |     > 5,000 |
| Solid                                 |     48.3 |     52.8 |     69.0 |      97.8 |       164 |       342 |        649 |      1,285 |      3,473 |     > 5,000 |
| Preact Signals                        |     7.75 |     10.1 |     17.5 |      30.4 |      57.5 |       138 |        285 |        580 |      1,546 |       3,306 |

<!-- /benchmark -->

### What the results show

synstate-next's `map` compares the bucket with its previous value, and a value that does not change stops there: 999 writes in 1000 reach no view, and the time stays between <!-- benchmark:unchanged-subject-range -->10.2–19.9<!-- /benchmark --> ms from $W = 1$ to $W = 1000$, as RxJS's does with `distinctUntilChanged`. Preact Signals, Solid, MobX and Jotai also keep an unchanged value from reaching a subscriber, but a write first marks every view below the state as possibly out of date, and each view is checked before the unchanged bucket is found. Redux calls every subscriber on every write. The rows of Preact Signals, Solid, MobX, Jotai, Redux and RxJS without `distinctUntilChanged` grow with $W$.

### Implementations

#### synstate-next

```ts
export const runBenchmark = (k: number, width: number): number => {
    const [source, setSource] = createState(0);

    // Equal to its previous value on 999 updates in 1000. `map` compares its
    // result with `Object.is`, and a value that does not change stops there.
    const bucket = source.pipe(map((v) => Math.floor(v / 1000)));

    const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

    const unsubscribes = Arr.seq(asUint32(width)).map((i) =>
        bucket.pipe(map((b) => b + i)).subscribe((v) => {
            mut_lastValues[i] = v;
        }),
    );

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        setSource(mut_i);
    }

    for (const unsubscribe of unsubscribes) {
        unsubscribe();
    }

    return Arr.sum(mut_lastValues);
};
```

#### RxJS (`distinctUntilChanged`)

```ts
export const runBenchmark = (k: number, width: number): number => {
    const source = new BehaviorSubject(0);

    // Equal to its previous value on 999 updates in 1000, which
    // `distinctUntilChanged` drops. `shareReplay` makes it one node for every
    // view, as a derived value is in the other libraries; without it each
    // subscription would run its own `map`.
    const bucket = source.pipe(
        map((v) => Math.floor(v / 1000)),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

    const subscriptions = Arr.seq(asUint32(width)).map((i) =>
        bucket.pipe(map((b) => b + i)).subscribe((v) => {
            mut_lastValues[i] = v;
        }),
    );

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        source.next(mut_i);
    }

    for (const subscription of subscriptions) {
        subscription.unsubscribe();
    }

    return Arr.sum(mut_lastValues);
};
```

#### RxJS (naive, without `distinctUntilChanged`)

```ts
export const runBenchmark = (k: number, width: number): number => {
    const source = new BehaviorSubject(0);

    // The same graph without `distinctUntilChanged`: the bucket is emitted on
    // every update, equal or not, and every view runs.
    const bucket = source.pipe(
        map((v) => Math.floor(v / 1000)),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

    const subscriptions = Arr.seq(asUint32(width)).map((i) =>
        bucket.pipe(map((b) => b + i)).subscribe((v) => {
            mut_lastValues[i] = v;
        }),
    );

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        source.next(mut_i);
    }

    for (const subscription of subscriptions) {
        subscription.unsubscribe();
    }

    return Arr.sum(mut_lastValues);
};
```

#### MobX

```ts
export const runBenchmark = (k: number, width: number): number => {
    const state = observable({ source: 0 });

    // Equal to its previous value on 999 updates in 1000. A `computed` compares
    // its result and does not change when it is equal.
    const bucket = computed(() => Math.floor(state.source / 1000));

    const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

    const disposers = Arr.seq(asUint32(width)).map((i) => {
        const view = computed(() => bucket.get() + i);

        return reaction(
            () => view.get(),
            (v) => {
                mut_lastValues[i] = v;
            },
            { fireImmediately: true },
        );
    });

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        runInAction(() => {
            state.source = mut_i;
        });
    }

    for (const dispose of disposers) {
        dispose();
    }

    return Arr.sum(mut_lastValues);
};
```

#### Jotai

```ts
export const runBenchmark = (k: number, width: number): number => {
    const sourceAtom = atom(0);

    // Equal to its previous value on 999 updates in 1000. A derived atom compares
    // its result with `Object.is` and does not change when it is equal.
    const bucketAtom = atom((get) => Math.floor(get(sourceAtom) / 1000));

    const store = createStore();

    const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

    const disposers = Arr.seq(asUint32(width)).map((i) => {
        const viewAtom = atom((get) => get(bucketAtom) + i);

        mut_lastValues[i] = store.get(viewAtom);

        return store.sub(viewAtom, () => {
            mut_lastValues[i] = store.get(viewAtom);
        });
    });

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        store.set(sourceAtom, mut_i);
    }

    for (const dispose of disposers) {
        dispose();
    }

    return Arr.sum(mut_lastValues);
};
```

#### Redux

```ts
export const runBenchmark = (k: number, width: number): number => {
    const counterSlice = createSlice({
        name: 'counter',
        initialState: { value: 0 },
        reducers: {
            set: (state, action: Readonly<{ payload: number }>) => {
                state.value = action.payload;
            },
        },
    });

    const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: () => new Tuple(),
    });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const selectCounter = (state: Readonly<{ value: number }>): number =>
        state.value;

    // Equal to its previous value on 999 updates in 1000, so each view's
    // selector, which compares its input with the previous one, returns its
    // cached result. `lruMemoize` for the reason the derived chain gives.
    const selectBucket = createSelector(
        selectCounter,
        (counter) => Math.floor(counter / 1000),
        { memoize: lruMemoize },
    );

    const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

    // One subscriber per view, as each `useSelector` is: the store calls every
    // one of them on every dispatch.
    const disposers = Arr.seq(asUint32(width)).map((i) => {
        const selectView = createSelector(selectBucket, (b) => b + i, {
            memoize: lruMemoize,
        });

        mut_lastValues[i] = selectView(store.getState());

        return store.subscribe(() => {
            mut_lastValues[i] = selectView(store.getState());
        });
    });

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        store.dispatch(counterSlice.actions.set(mut_i));
    }

    for (const dispose of disposers) {
        dispose();
    }

    return Arr.sum(mut_lastValues);
};
```

#### Solid

```ts
export const runBenchmark = (k: number, width: number): number => {
    const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

    const { setSource, dispose } = createRoot((disposeRoot) => {
        const [source, setSourceValue] = createSignal(0);

        // Equal to its previous value on 999 updates in 1000. A memo compares its
        // result with `===` and does not change when it is equal.
        const bucket = createMemo(() => Math.floor(source() / 1000));

        for (const i of range(0, asSafeUint(width))) {
            const view = createMemo(() => bucket() + i);

            createEffect(() => {
                mut_lastValues[i] = view();
            });
        }

        return { setSource: setSourceValue, dispose: disposeRoot };
    });

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        setSource(mut_i);
    }

    dispose();

    return Arr.sum(mut_lastValues);
};
```

#### Preact Signals

```ts
export const runBenchmark = (k: number, width: number): number => {
    const source = signal(0);

    // Equal to its previous value on 999 updates in 1000. A `computed` compares
    // its result and keeps its version when it is equal.
    const bucket = computed(() => Math.floor(source.value / 1000));

    const mut_lastValues = Arr.zeros(asUint32(width)).map(() => 0);

    const disposers = Arr.seq(asUint32(width)).map((i) => {
        const view = computed(() => bucket.value + i);

        return effect(() => {
            mut_lastValues[i] = view.value;
        });
    });

    for (let mut_i = 1; mut_i <= k; mut_i++) {
        source.value = mut_i;
    }

    for (const dispose of disposers) {
        dispose();
    }

    return Arr.sum(mut_lastValues);
};
```

## Methodology

- **Runs**: the first three scenarios run $N = 100{,}000$ writes 5 times unmeasured and 20 times measured; the table shows the median, p95 and updates per second of all <!-- benchmark:stats-runs -->140<!-- /benchmark --> measured runs, <!-- benchmark:rounds -->7<!-- /benchmark --> processes of 20. The others run each point 2 times unmeasured and up to 5 times measured, and show the median of each process's median.
- **Timeout**: within a round, a run longer than <!-- benchmark:timeout -->5,000<!-- /benchmark --> ms ends its point, and no larger point is measured in that round (in the deep chain, one at least as large in both $K$ and $M$). A point shows as `>` when most of the <!-- benchmark:rounds -->7<!-- /benchmark --> rounds did not finish it.
- **Isolation**: each library is measured in a Node.js process of its own, <!-- benchmark:rounds -->7<!-- /benchmark --> times, in an order that changes from one time to the next. V8 optimizes a function for the shapes it has seen, so in a shared process a library would inherit what the ones before it taught it.
- **Checked before timed**: each library's result is checked before it is timed, so that a library computing nothing is not timed as a fast one.
- **Builds**: `NODE_ENV=production`, so that no library runs its development-only checks. Valtio's ES module build reads `import.meta.env.MODE`, which Node does not define; its few development checks run when a subscription is made, not on each write.

### Keeping the comparison fair

- **Zustand** and **Valtio** take part in the single state only. Neither has a derived value in its vanilla API, so in the other scenarios they could only compute the value inside the subscriber, a smaller graph than the others build.
- **Redux**: the default middleware is turned off, since it is a development aid. In the deep chain and the conditional fan-out the reducer is a plain function rather than a `createSlice` reducer, because an Immer draft of $M$ points or $B$ branches would measure Immer. A selector cannot read its own previous output, so its deep chain is a loop in the reducer.
- **MobX** and **Preact Signals** (deep chain): a `computed` is not given its previous value, so each stage is a box or signal that one reaction or effect advances in a batch. **Solid**'s stages are memos given their previous value.
- **Solid**: the scenarios import the client build, `solid-js/dist/solid.js`; under Node, `solid-js` resolves to the server build, in which an effect never runs.
- **RxJS**: a merge is `combineLatest` and a `map`, which is how RxJS writes one. In the unchanged value scenario, `bucket` is shared with `shareReplay({ bufferSize: 1, refCount: true })` so that it is one node for every view.
- **Naive rows**: in the conditional fan-out, synstate-next and RxJS are also written with a `derive` or `combineLatest` over every branch, and in the unchanged value scenario RxJS without `distinctUntilChanged`. These rows show what that way of writing costs, not how either library is meant to be used, and the summary leaves them out.
- Except in the deep chain, every library builds its graph inside the timed function, so building is part of the time.
