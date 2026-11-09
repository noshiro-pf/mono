---
title: Benchmark
description: How long synstate-next takes to propagate updates, beside RxJS, MobX, Jotai, Redux, Solid, Preact Signals, Zustand and Valtio, in seven graph shapes.
---

This page times synstate-next and eight other state libraries on the same graphs: a single state, small derived graphs, a long chain, chained diamonds, a branch nobody reads, and a value that rarely changes under many readers. Each scenario asks one question about one shape of graph, so compare libraries within a scenario, not across scenarios.

## Summary

<!-- benchmark:summary -->

| Scenario                                             | Fastest                     | synstate-next ÷ fastest | Slowest | Slowest ÷ fastest |
| :--------------------------------------------------- | :-------------------------- | ----------------------: | :------ | ----------------: |
| [Single state](#single-state)                        | RxJS                        |                    2.3× | Jotai   |               56× |
| [Derived chain](#derived-chain)                      | RxJS                        |                    2.6× | Jotai   |              133× |
| [Diamond](#diamond)                                  | RxJS                        |                    1.2× | Jotai   |               68× |
| [Deep chain](#deep-chain) (K=1000, M=200)            | Redux                       |                    2.3× | RxJS    |              592× |
| [Cascaded diamond](#cascaded-diamond) (N=20)         | synstate-next               |                    1.0× | RxJS    |         > 20,324× |
| [Conditional fan-out](#conditional-fan-out) (B=1000) | Solid                       |                    1.7× | Redux   |              219× |
| [Unchanged value](#unchanged-value) (W=50)           | RxJS (distinctUntilChanged) |                    1.7× | Redux   |            > 654× |

<!-- /benchmark -->

In no scenario does synstate-next take more than <!-- benchmark:subject-worst-over-fastest -->2.6×<!-- /benchmark --> as long as the fastest library there, while the slowest library in each takes at least <!-- benchmark:slowest-over-fastest-least -->56×<!-- /benchmark --> as long. A ratio marked `>` belongs to a library that did not finish within <!-- benchmark:timeout -->5,000<!-- /benchmark --> ms, counted as if it had taken exactly that long.

Read the other way round, the same figures give each library its worst case: the scenario where it is furthest from the fastest library, and how far.

<!-- benchmark:worst -->

| Library           | Scenario where it trails most                | Fastest there               | Library ÷ fastest |
| :---------------- | :------------------------------------------- | :-------------------------- | ----------------: |
| **synstate-next** | [Derived chain](#derived-chain)              | RxJS                        |              2.6× |
| RxJS              | [Cascaded diamond](#cascaded-diamond) (N=20) | synstate-next               |         > 20,324× |
| MobX              | [Deep chain](#deep-chain) (K=1000, M=200)    | Redux                       |              121× |
| Jotai             | [Unchanged value](#unchanged-value) (W=50)   | RxJS (distinctUntilChanged) |              288× |
| Redux             | [Unchanged value](#unchanged-value) (W=50)   | RxJS (distinctUntilChanged) |            > 654× |
| Solid             | [Unchanged value](#unchanged-value) (W=50)   | RxJS (distinctUntilChanged) |               45× |
| Preact Signals    | [Unchanged value](#unchanged-value) (W=50)   | RxJS (distinctUntilChanged) |               18× |
| Zustand           | [Single state](#single-state)                | RxJS                        |              1.3× |
| Valtio            | [Single state](#single-state)                | RxJS                        |               10× |

<!-- /benchmark -->

synstate-next trails most in <!-- benchmark:subject-worst-scenario -->[Derived chain](#derived-chain)<!-- /benchmark -->; in its worst case, every other library measured in all seven scenarios takes at least <!-- benchmark:others-worst-least -->18×<!-- /benchmark --> as long as the fastest. Zustand and Valtio take part in the single state only (see [Keeping the comparison fair](#keeping-the-comparison-fair)), so their worst case is over that scenario alone. In the conditional fan-out, synstate-next and RxJS are counted in their `switchMap` form; the rows written naively are shown in that scenario but left out of this summary.

:::note[How these numbers are produced]
`pnpm --filter synstate-next-docs run benchmark` measures every scenario and rewrites the tables and figures on this page. Each library is measured three times, each time in a Node.js process of its own, with every library in production mode. Where a sentence on this page no longer holds for a new measurement, the command stops and names it. The code is in [the documentation package](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-next-docs/scripts/benchmark).

<!-- benchmark:environment -->

|           |                                                                                                                                          |
| :-------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js   | v26.13.0                                                                                                                                 |
| OS        | Linux 6.18.44-fc-v338 (x64)                                                                                                              |
| CPU       | Intel(R) Xeon(R) Processor @ 2.10GHz                                                                                                     |
| Libraries | rxjs 7.8.2, mobx 7.1.0, jotai 3.0.1, @reduxjs/toolkit 2.13.0, solid-js 1.9.17, @preact/signals-core 1.14.4, zustand 5.0.15, valtio 2.3.2 |
| Measured  | 2026-11-10                                                                                                                               |

<!-- /benchmark -->

Milliseconds are comparable only within one machine. To compare with your own measurement, compare the ratios between libraries.
:::

## Single state

One state, one subscriber, nothing derived: the floor every other scenario builds on, and the only scenario in which Zustand and Valtio take part. The state is written $N = 100{,}000$ times, and the subscriber records each value.

<!-- benchmark:results/single-state -->

| Library           | Median (ms) | p95 (ms) | Updates per second | ÷ synstate-next |
| :---------------- | ----------: | -------: | -----------------: | --------------: |
| **synstate-next** |        9.16 |     15.8 |         10,921,252 |            1.0× |
| RxJS              |        4.04 |     5.53 |         24,781,922 |            0.4× |
| MobX              |        53.4 |     63.8 |          1,872,833 |            5.8× |
| Jotai             |         226 |      301 |            442,759 |             25× |
| Redux             |         126 |      192 |            796,400 |             14× |
| Solid             |        26.4 |     45.4 |          3,783,141 |            2.9× |
| Preact Signals    |        6.19 |     10.4 |         16,146,027 |            0.7× |
| Zustand           |        5.39 |     7.13 |         18,551,614 |            0.6× |
| Valtio            |        40.9 |     65.4 |          2,443,481 |            4.5× |

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
| **synstate-next** |        17.2 |     25.2 |          5,800,950 |            1.0× |
| RxJS              |        6.71 |     11.5 |         14,913,449 |            0.4× |
| MobX              |         138 |      221 |            723,922 |            8.0× |
| Jotai             |         890 |    1,058 |            112,399 |             52× |
| Redux             |         363 |      461 |            275,158 |             21× |
| Solid             |        83.7 |      103 |          1,194,833 |            4.9× |
| Preact Signals    |        16.2 |     27.2 |          6,166,906 |            0.9× |

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
| **synstate-next** |        22.8 |     38.9 |          4,384,550 |            1.0× |
| RxJS              |        18.6 |     27.2 |          5,363,206 |            0.8× |
| MobX              |         161 |      198 |            622,329 |            7.0× |
| Jotai             |       1,276 |    1,549 |             78,386 |             56× |
| Redux             |         442 |      520 |            226,284 |             19× |
| Solid             |         102 |      136 |            983,900 |            4.5× |
| Preact Signals    |        25.1 |     43.1 |          3,981,898 |            1.1× |

<!-- /benchmark -->

### What the first three scenarios show

On these small graphs the time is mostly what a library does for each write, and synstate-next takes at most <!-- benchmark:small-graphs-subject-over-fastest-max -->2.6×<!-- /benchmark --> as long as the fastest library in each. The fastest do less per write. RxJS passes each value straight on to the next `subscribe`, with no step that orders the update, which is also why its subscriber sees a mix of an old and a new value in the diamond. Preact Signals computes a value only when something reads it. synstate-next computes every value a write reaches, parents before children, before it calls any subscriber, so that each subscriber sees every value up to date and is called once. Solid, MobX, Jotai and Redux take longer than synstate-next in all three.

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
| **synstate-next** |             0.82 |             1.99 |              4.01 |              0.61 |              3.37 |               6.96 |              6.60 |               13.1 |
| RxJS              |             8.81 |             42.8 |              83.6 |              69.4 |               367 |                717 |             1,716 |              3,437 |
| MobX              |             17.4 |             84.1 |               166 |              33.7 |               174 |                333 |               344 |                703 |
| Jotai             |             25.1 |              120 |               222 |              47.2 |               231 |                469 |               482 |                930 |
| Redux             |             0.56 |             2.87 |              5.88 |              0.76 |              3.72 |               5.46 |              8.24 |               5.80 |
| Solid             |             1.86 |             7.08 |              13.3 |              2.63 |              13.0 |               29.2 |              29.5 |               61.2 |
| Preact Signals    |             1.31 |             2.25 |              3.65 |              0.63 |              3.35 |               9.22 |              9.09 |               18.0 |

<!-- /benchmark -->

### What the results show

When the chain gets four times deeper ($M = 50 \to 200$ at $K = 1000$), synstate-next takes <!-- benchmark:deep-chain-subject-growth -->3.3×<!-- /benchmark --> as long and RxJS <!-- benchmark:deep-chain-rxjs-growth -->41×<!-- /benchmark -->. Of all the libraries, RxJS's time grows the most as the chain gets deeper. synstate-next computes each stage once per move and calls the subscriber once. RxJS's `combineLatest` emits each time one of its $M + 1$ inputs moves, so its subscriber is called $M + 1$ times per move, each time with $M + 1$ points. Redux, MobX and Preact Signals advance the whole chain in one loop inside a reducer, reaction or effect, so their rows time a loop rather than a chain of derived values (see [Keeping the comparison fair](#keeping-the-comparison-fair)).

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
| **synstate-next** |     0.22 |     0.23 |     0.35 |     0.19 |      0.22 |      0.18 |      0.19 |      0.23 |      0.23 |      0.25 |
| RxJS              |     0.26 |     1.38 |     5.10 |     30.6 |       172 |     1,065 |   > 5,000 |   > 5,000 |   > 5,000 |   > 5,000 |
| MobX              |     0.94 |     1.02 |     0.80 |     0.90 |      0.87 |      1.03 |      1.24 |      1.30 |      1.44 |      1.60 |
| Jotai             |     3.23 |     5.67 |     7.45 |     9.52 |      12.0 |      10.9 |      12.3 |      14.2 |      20.4 |      21.7 |
| Redux             |     1.49 |     1.51 |     1.60 |     2.17 |      2.22 |      3.39 |      3.67 |      3.53 |      3.88 |      4.42 |
| Solid             |     0.59 |     0.55 |     0.79 |     0.85 |      1.00 |      0.92 |      0.99 |      1.11 |      1.23 |      1.40 |
| Preact Signals    |     0.16 |     0.15 |     0.21 |     0.24 |      0.29 |      0.25 |      0.29 |      0.32 |      0.35 |      0.37 |

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
| **synstate-next (switchMap)**    |     1.76 |     1.54 |      1.29 |      1.19 |      1.27 |       1.33 |       1.36 |       1.36 |        1.63 |
| **synstate-next (naive derive)** |     15.6 |     17.2 |      19.6 |      36.6 |      46.3 |       71.5 |        138 |        381 |       1,023 |
| RxJS (switchMap)                 |     3.13 |     3.07 |      2.88 |      2.86 |      2.85 |       2.91 |       2.89 |       3.01 |        3.49 |
| RxJS (naive combineLatest)       |     11.0 |     8.24 |      8.44 |      8.11 |      9.30 |       11.7 |       15.1 |       26.8 |        54.0 |
| MobX                             |     1.53 |     1.51 |      1.34 |      1.37 |      1.39 |       1.41 |       1.39 |       1.49 |        1.51 |
| Jotai                            |      168 |      158 |       152 |       153 |       153 |        152 |        158 |        156 |         174 |
| Redux                            |      115 |      120 |       118 |       113 |       133 |        132 |        139 |        171 |         210 |
| Solid                            |     0.82 |     0.76 |      0.82 |      0.76 |      0.77 |       0.77 |       0.82 |       0.85 |        0.96 |
| Preact Signals                   |     2.03 |     1.73 |      1.89 |      1.81 |      1.78 |       1.72 |       1.65 |       1.82 |        2.73 |

<!-- /benchmark -->

### What the results show

Written with `switchMap`, synstate-next's time does not grow with $B$. `switchMap` follows the picked branch only, so a write to branch 1 reaches nothing, and the time stays between <!-- benchmark:fan-out-switch-map-range -->1.19–1.76<!-- /benchmark --> ms at every $B$, as it does for MobX, Solid and Preact Signals, which follow only what was read. Written naively, with a `derive` over every branch, each write computes the `derive` again from all $B$ values, and at <!-- benchmark:fan-out-summary-point -->$B = 1000$<!-- /benchmark --> that takes <!-- benchmark:fan-out-naive-over-fastest -->1,066×<!-- /benchmark --> as long as the fastest library. The scenario never changes the selector, so it does not time switching branches.

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
| **synstate-next**                     |     12.4 |     12.2 |     12.3 |      12.0 |      12.1 |      12.6 |       12.5 |       13.3 |       25.3 |        22.6 |
| RxJS (distinctUntilChanged)           |     13.8 |     8.01 |     7.03 |      12.1 |      9.55 |      7.65 |       8.14 |       10.4 |       12.7 |        17.0 |
| RxJS (naive, no distinctUntilChanged) |     22.1 |     24.0 |     28.4 |      53.2 |      90.4 |       215 |        389 |        721 |      1,692 |       3,442 |
| MobX                                  |     58.5 |     74.2 |      126 |       221 |       374 |       787 |      1,380 |      2,683 |    > 5,000 |     > 5,000 |
| Jotai                                 |      513 |      593 |      740 |       828 |     1,129 |     2,204 |      4,401 |    > 5,000 |    > 5,000 |     > 5,000 |
| Redux                                 |      341 |      463 |      717 |     1,258 |     2,088 |   > 5,000 |    > 5,000 |    > 5,000 |    > 5,000 |     > 5,000 |
| Solid                                 |     40.8 |     47.6 |     66.3 |       100 |       181 |       345 |        780 |      1,465 |      3,631 |     > 5,000 |
| Preact Signals                        |     9.02 |     12.6 |     21.8 |      34.9 |      64.8 |       136 |        272 |        533 |      1,267 |       2,610 |

<!-- /benchmark -->

### What the results show

synstate-next's `map` compares the bucket with its previous value, and a value that does not change stops there: 999 writes in 1000 reach no view, and the time stays between <!-- benchmark:unchanged-subject-range -->12.0–25.3<!-- /benchmark --> ms from $W = 1$ to $W = 1000$, as RxJS's does with `distinctUntilChanged`. Preact Signals, Solid, MobX and Jotai also keep an unchanged value from reaching a subscriber, but a write first marks every view below the state as possibly out of date, and each view is checked before the unchanged bucket is found. Redux calls every subscriber on every write. The rows of Preact Signals, Solid, MobX, Jotai, Redux and RxJS without `distinctUntilChanged` grow with $W$.

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

- **Runs**: the first three scenarios run $N = 100{,}000$ writes 5 times unmeasured and 20 times measured; the table shows the median, p95 and updates per second of all 60 measured runs, three processes of 20. The others run each point 2 times unmeasured and up to 5 times measured, and show the median of each process's median.
- **Timeout**: within a round, a run longer than <!-- benchmark:timeout -->5,000<!-- /benchmark --> ms ends its point, and no larger point is measured in that round (in the deep chain, one at least as large in both $K$ and $M$). A point shows as `>` when most of the three rounds did not finish it.
- **Isolation**: each library is measured in a Node.js process of its own, three times, in an order that changes from one time to the next. V8 optimizes a function for the shapes it has seen, so in a shared process a library would inherit what the ones before it taught it.
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
