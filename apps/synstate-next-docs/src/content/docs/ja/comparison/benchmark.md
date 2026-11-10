---
title: ベンチマーク
description: synstate-next が更新を伝えるのにかかる時間を、RxJS、MobX、Jotai、Redux、Solid、Preact Signals、Zustand、Valtio と並べ、7 つの形のグラフで計ります。
---

このページでは、synstate-next とほかの 8 つの状態ライブラリを同じグラフで計ります。単一の状態、小さな派生のグラフ、長いチェーン、連なったダイヤモンド、誰も読まない分岐、そしてめったに変わらない値とその下の多くの読み手です。各シナリオは 1 つの形のグラフについて 1 つのことを問うものなので、ライブラリはシナリオの中で比べ、シナリオをまたいでは比べないでください。

## まとめ

<!-- benchmark:summary -->

| シナリオ                                             | 最速                        | synstate-next ÷ 最速 | 最遅  | 最遅 ÷ 最速 |
| :--------------------------------------------------- | :-------------------------- | -------------------: | :---- | ----------: |
| [単一の状態](#単一の状態)                            | RxJS                        |                 2.3× | Jotai |         56× |
| [派生のチェーン](#派生のチェーン)                    | RxJS                        |                 2.6× | Jotai |        133× |
| [ダイヤモンド](#ダイヤモンド)                        | RxJS                        |                 1.2× | Jotai |         68× |
| [深いチェーン](#深いチェーン) (K=1000, M=200)        | Redux                       |                 2.3× | RxJS  |        592× |
| [連なったダイヤモンド](#連なったダイヤモンド) (N=20) | synstate-next               |                 1.0× | RxJS  |   > 20,324× |
| [条件付きの分岐](#条件付きの分岐) (B=1000)           | Solid                       |                 1.7× | Redux |        219× |
| [変わらない値](#変わらない値) (W=50)                 | RxJS (distinctUntilChanged) |                 1.7× | Redux |      > 654× |

<!-- /benchmark -->

synstate-next は、どのシナリオでもそこで最速のライブラリの <!-- benchmark:subject-worst-over-fastest -->2.6×<!-- /benchmark --> を超える時間はかかりません。一方、各シナリオで最も遅いライブラリは、少なくとも <!-- benchmark:slowest-over-fastest-least -->56×<!-- /benchmark --> の時間がかかります。`>` の付いた比は、<!-- benchmark:timeout -->5,000<!-- /benchmark --> ms 以内に終わらなかったライブラリのもので、ちょうどその時間かかったものとして数えています。

同じ値を逆から読むと、各ライブラリの最悪の場合が分かります。最速のライブラリから最も離れるシナリオと、その差です。

<!-- benchmark:worst -->

| ライブラリ        | 最も遅れるシナリオ                                   | そこでの最速                | ライブラリ ÷ 最速 |
| :---------------- | :--------------------------------------------------- | :-------------------------- | ----------------: |
| **synstate-next** | [派生のチェーン](#派生のチェーン)                    | RxJS                        |              2.6× |
| RxJS              | [連なったダイヤモンド](#連なったダイヤモンド) (N=20) | synstate-next               |         > 20,324× |
| MobX              | [深いチェーン](#深いチェーン) (K=1000, M=200)        | Redux                       |              121× |
| Jotai             | [変わらない値](#変わらない値) (W=50)                 | RxJS (distinctUntilChanged) |              288× |
| Redux             | [変わらない値](#変わらない値) (W=50)                 | RxJS (distinctUntilChanged) |            > 654× |
| Solid             | [変わらない値](#変わらない値) (W=50)                 | RxJS (distinctUntilChanged) |               45× |
| Preact Signals    | [変わらない値](#変わらない値) (W=50)                 | RxJS (distinctUntilChanged) |               18× |
| Zustand           | [単一の状態](#単一の状態)                            | RxJS                        |              1.3× |
| Valtio            | [単一の状態](#単一の状態)                            | RxJS                        |               10× |

<!-- /benchmark -->

synstate-next が最も遅れるのは <!-- benchmark:subject-worst-scenario -->[派生のチェーン](#派生のチェーン)<!-- /benchmark --> です。7 つすべてのシナリオで計ったほかのライブラリは、最悪の場合にどれも最速の <!-- benchmark:others-worst-least -->18×<!-- /benchmark --> 以上です。Zustand と Valtio は単一の状態だけに参加しているので（[比較を公平に保つために](#比較を公平に保つために)）、最悪の場合もそのシナリオだけで見ています。条件付きの分岐では、synstate-next と RxJS は `switchMap` で書いたものを数えます。素朴に書いた行はそのシナリオには載せていますが、このまとめからは外しています。

:::note[この値の作り方]
`pnpm --filter synstate-next-docs run benchmark` がすべてのシナリオを計り、このページの表と数値を書き換えます。各ライブラリはそれぞれ専用の Node.js プロセスで 3 回計り、どのライブラリも本番モードで動かします。新しい計測でこのページの文が成り立たなくなると、コマンドはその文を挙げて止まります。コードは[ドキュメントのパッケージ](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-next-docs/scripts/benchmark)にあります。

<!-- benchmark:environment -->

|            |                                                                                                                                          |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js    | v26.13.0                                                                                                                                 |
| OS         | Linux 6.18.44-fc-v338 (x64)                                                                                                              |
| CPU        | Intel(R) Xeon(R) Processor @ 2.10GHz                                                                                                     |
| ライブラリ | rxjs 7.8.2, mobx 7.1.0, jotai 3.0.1, @reduxjs/toolkit 2.13.0, solid-js 1.9.17, @preact/signals-core 1.14.4, zustand 5.0.15, valtio 2.3.2 |
| 計測日     | 2026-11-10                                                                                                                               |

<!-- /benchmark -->

ミリ秒の値は同じマシンの中でしか比べられません。手元の計測と比べるときは、ライブラリ同士の比を比べてください。
:::

## 単一の状態

状態が 1 つ、購読者が 1 つで、派生値はありません。ほかのすべてのシナリオの土台で、Zustand と Valtio が参加する唯一のシナリオです。状態に $N = 100{,}000$ 回書き込み、購読者は値を毎回記録します。

<!-- benchmark:results/single-state -->

| ライブラリ        | 中央値 (ms) | p95 (ms) | 1 秒あたりの更新 | ÷ synstate-next |
| :---------------- | ----------: | -------: | ---------------: | --------------: |
| **synstate-next** |        9.16 |     15.8 |       10,921,252 |            1.0× |
| RxJS              |        4.04 |     5.53 |       24,781,922 |            0.4× |
| MobX              |        53.4 |     63.8 |        1,872,833 |            5.8× |
| Jotai             |         226 |      301 |          442,759 |             25× |
| Redux             |         126 |      192 |          796,400 |             14× |
| Solid             |        26.4 |     45.4 |        3,783,141 |            2.9× |
| Preact Signals    |        6.19 |     10.4 |       16,146,027 |            0.7× |
| Zustand           |        5.39 |     7.13 |       18,551,614 |            0.6× |
| Valtio            |        40.9 |     65.4 |        2,443,481 |            4.5× |

<!-- /benchmark -->

### 実装

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

## 派生のチェーン

状態を 2 倍し、その結果をさらに 2 倍して、最後に購読者を 1 つ置きます。派生値が 2 つ並んだグラフに、$N = 100{,}000$ 回書き込みます。

<!-- benchmark:results/derived-chain -->

| ライブラリ        | 中央値 (ms) | p95 (ms) | 1 秒あたりの更新 | ÷ synstate-next |
| :---------------- | ----------: | -------: | ---------------: | --------------: |
| **synstate-next** |        17.2 |     25.2 |        5,800,950 |            1.0× |
| RxJS              |        6.71 |     11.5 |       14,913,449 |            0.4× |
| MobX              |         138 |      221 |          723,922 |            8.0× |
| Jotai             |         890 |    1,058 |          112,399 |             52× |
| Redux             |         363 |      461 |          275,158 |             21× |
| Solid             |        83.7 |      103 |        1,194,833 |            4.9× |
| Preact Signals    |        16.2 |     27.2 |        6,166,906 |            0.9× |

<!-- /benchmark -->

### 実装

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

## ダイヤモンド

状態を 2 倍したものと 3 倍したものを足します。1 つの状態から出た 2 つの経路が再び合流します。グリッチフリーなライブラリは、書き込みごとに購読者を 1 回、両側が最新の状態で呼びます。状態には $N = 100{,}000$ 回書き込みます。

<!-- benchmark:results/diamond -->

| ライブラリ        | 中央値 (ms) | p95 (ms) | 1 秒あたりの更新 | ÷ synstate-next |
| :---------------- | ----------: | -------: | ---------------: | --------------: |
| **synstate-next** |        22.8 |     38.9 |        4,384,550 |            1.0× |
| RxJS              |        18.6 |     27.2 |        5,363,206 |            0.8× |
| MobX              |         161 |      198 |          622,329 |            7.0× |
| Jotai             |       1,276 |    1,549 |           78,386 |             56× |
| Redux             |         442 |      520 |          226,284 |             19× |
| Solid             |         102 |      136 |          983,900 |            4.5× |
| Preact Signals    |        25.1 |     43.1 |        3,981,898 |            1.1× |

<!-- /benchmark -->

### 最初の 3 つのシナリオから分かること

小さなグラフでは、時間のほとんどはライブラリが書き込みごとに行う処理で、synstate-next はどのシナリオでも最速のライブラリの <!-- benchmark:small-graphs-subject-over-fastest-max -->2.6×<!-- /benchmark --> 以内に収まります。最速のライブラリは書き込みごとの処理が少ないものです。RxJS は値をそのまま次の `subscribe` に渡し、更新の順番を整える手順を持ちません。ダイヤモンドで購読者が古い値と新しい値の混ざった組み合わせを見るのもそのためです。Preact Signals は、何かが読むまで値を計算しません。synstate-next は書き込みが届くすべての値を親から子の順に計算してから購読者を呼ぶので、どの購読者もすべての値が最新の状態を見て、呼ばれるのは 1 回です。Solid、MobX、Jotai、Redux は 3 つすべてで synstate-next より時間がかかります。

### 実装

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

## 深いチェーン

先頭の点の後ろに $M$ 個の段が続き、先頭が動くたびに、各段は 1 つ前の段に向かって少しずつ動きます。ポインターを追う軌跡のようなものです。購読者は 1 つで、$M + 1$ 個の点をすべて受け取ります。グラフは計測の外で一度だけ作り、先頭を $K$ 回動かします。

<!-- benchmark:results/deep-chain -->

| ライブラリ        | K=100, M=50 (ms) | K=500, M=50 (ms) | K=1000, M=50 (ms) | K=100, M=100 (ms) | K=500, M=100 (ms) | K=1000, M=100 (ms) | K=500, M=200 (ms) | K=1000, M=200 (ms) |
| :---------------- | ---------------: | ---------------: | ----------------: | ----------------: | ----------------: | -----------------: | ----------------: | -----------------: |
| **synstate-next** |             0.82 |             1.99 |              4.01 |              0.61 |              3.37 |               6.96 |              6.60 |               13.1 |
| RxJS              |             8.81 |             42.8 |              83.6 |              69.4 |               367 |                717 |             1,716 |              3,437 |
| MobX              |             17.4 |             84.1 |               166 |              33.7 |               174 |                333 |               344 |                703 |
| Jotai             |             25.1 |              120 |               222 |              47.2 |               231 |                469 |               482 |                930 |
| Redux             |             0.56 |             2.87 |              5.88 |              0.76 |              3.72 |               5.46 |              8.24 |               5.80 |
| Solid             |             1.86 |             7.08 |              13.3 |              2.63 |              13.0 |               29.2 |              29.5 |               61.2 |
| Preact Signals    |             1.31 |             2.25 |              3.65 |              0.63 |              3.35 |               9.22 |              9.09 |               18.0 |

<!-- /benchmark -->

### 結果から分かること

チェーンを 4 倍深くすると（$K = 1000$ で $M = 50 \to 200$）、synstate-next の時間は <!-- benchmark:deep-chain-subject-growth -->3.3×<!-- /benchmark -->、RxJS は <!-- benchmark:deep-chain-rxjs-growth -->41×<!-- /benchmark --> になります。チェーンが深くなったときに時間が最も伸びるのは RxJS です。synstate-next は 1 回の移動で各段を 1 回だけ計算し、購読者を 1 回呼びます。RxJS の `combineLatest` は $M + 1$ 個の入力のどれかが動くたびに値を出すので、購読者は 1 回の移動で $M + 1$ 回、毎回 $M + 1$ 個の点とともに呼ばれます。Redux、MobX、Preact Signals は reducer、reaction、effect の中のループでチェーン全体を進めるので、これらの行は派生値のチェーンではなくループを計っています（[比較を公平に保つために](#比較を公平に保つために)）。

### 実装

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

ほかのライブラリのコードは [synstate のスループットのデモ](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-docs/src/components/throughput-demo/adapters)のものです。

## 連なったダイヤモンド

$N$ 個のダイヤモンドを並べます。各ダイヤモンドは 1 つ前の値を 2 つに分け、それを足し合わせます。状態から購読者までの経路は $2^N$ 本あり、派生値は $3N$ 個です。各回でグラフを作り、状態に $K = 100$ 回書き込みます。

<!-- benchmark:results/cascaded-diamond -->

| ライブラリ        | N=2 (ms) | N=4 (ms) | N=6 (ms) | N=8 (ms) | N=10 (ms) | N=12 (ms) | N=14 (ms) | N=16 (ms) | N=18 (ms) | N=20 (ms) |
| :---------------- | -------: | -------: | -------: | -------: | --------: | --------: | --------: | --------: | --------: | --------: |
| **synstate-next** |     0.22 |     0.23 |     0.35 |     0.19 |      0.22 |      0.18 |      0.19 |      0.23 |      0.23 |      0.25 |
| RxJS              |     0.26 |     1.38 |     5.10 |     30.6 |       172 |     1,065 |   > 5,000 |   > 5,000 |   > 5,000 |   > 5,000 |
| MobX              |     0.94 |     1.02 |     0.80 |     0.90 |      0.87 |      1.03 |      1.24 |      1.30 |      1.44 |      1.60 |
| Jotai             |     3.23 |     5.67 |     7.45 |     9.52 |      12.0 |      10.9 |      12.3 |      14.2 |      20.4 |      21.7 |
| Redux             |     1.49 |     1.51 |     1.60 |     2.17 |      2.22 |      3.39 |      3.67 |      3.53 |      3.88 |      4.42 |
| Solid             |     0.59 |     0.55 |     0.79 |     0.85 |      1.00 |      0.92 |      0.99 |      1.11 |      1.23 |      1.40 |
| Preact Signals    |     0.16 |     0.15 |     0.21 |     0.24 |      0.29 |      0.25 |      0.29 |      0.32 |      0.35 |      0.37 |

<!-- /benchmark -->

### 結果から分かること

$N$ が大きくなっても synstate-next の時間は伸びません。1 回の書き込みで $3N$ 個の派生値をそれぞれ 1 回だけ計算し、経路がいくつあっても購読者は 1 回だけ呼ばれます。新しい値は直接の親だけから自分の位置を決めるので、グラフを作るときも $2^N$ 本の経路はたどりません。RxJS の購読者は経路ごとに 1 回呼ばれ、<!-- benchmark:cascaded-rxjs-timeout -->$N = 14$<!-- /benchmark --> からは打ち切りの時間内に終わりません。

### 実装

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

ほかのライブラリのコードは [synstate のサンプル](https://github.com/noshiro-pf/mono/tree/main/libs/synstate/samples/docs-site/benchmark)の `04-cascaded-diamond.*.mts` です。

## 条件付きの分岐

$B$ 個の分岐と、そのうち 1 つを選ぶセレクターがあり、結果は選ばれた分岐の値です。セレクターは分岐 0 のままで、誰も読まない分岐 1 に $K = 100{,}000$ 回書き込みます。

<!-- benchmark:results/conditional-fan-out -->

| ライブラリ                       | B=2 (ms) | B=5 (ms) | B=10 (ms) | B=20 (ms) | B=50 (ms) | B=100 (ms) | B=200 (ms) | B=500 (ms) | B=1000 (ms) |
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

### 結果から分かること

`switchMap` で書くと、synstate-next の時間は $B$ が増えても伸びません。`switchMap` は選ばれた分岐だけを追うので、分岐 1 への書き込みはどこにも届かず、どの $B$ でも <!-- benchmark:fan-out-switch-map-range -->1.19–1.76<!-- /benchmark --> ms に収まります。読んだものだけを追う MobX、Solid、Preact Signals と同じです。すべての分岐にわたる `derive` で素朴に書くと、書き込みのたびに $B$ 個すべての値から `derive` を計算し直し、<!-- benchmark:fan-out-summary-point -->$B = 1000$<!-- /benchmark --> では最速のライブラリの <!-- benchmark:fan-out-naive-over-fastest -->1,066×<!-- /benchmark --> の時間がかかります。このシナリオはセレクターを変えないので、分岐を切り替えるコストは計っていません。

### 実装

#### synstate-next（`switchMap`）

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

#### synstate-next（素朴な `derive`）

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

#### RxJS（`switchMap`）

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

#### RxJS（素朴な `combineLatest`）

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

## 変わらない値

状態が 1 つ、そこから計算する `bucket` は 1000 回の書き込みに 1 回だけ変わり、その下に $W$ 個の view がそれぞれ自分の購読者を持ちます。めったに変わらない 1 つの値を多くが読む形で、キー入力のたびに変わるリストの下の「リストが空か」というフラグを多くのコンポーネントが読むのと同じです。状態には $K = 100{,}000$ 回書き込みます。

<!-- benchmark:results/unchanged-value -->

| ライブラリ                            | W=1 (ms) | W=2 (ms) | W=5 (ms) | W=10 (ms) | W=20 (ms) | W=50 (ms) | W=100 (ms) | W=200 (ms) | W=500 (ms) | W=1000 (ms) |
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

### 結果から分かること

synstate-next の `map` は bucket を前の値と比べ、変わらない値はそこで止まります。1000 回の書き込みのうち 999 回はどの view にも届かず、$W = 1$ から $W = 1000$ まで時間は <!-- benchmark:unchanged-subject-range -->12.0–25.3<!-- /benchmark --> ms に収まります。`distinctUntilChanged` を付けた RxJS も同じです。Preact Signals、Solid、MobX、Jotai も変わらない値を購読者には届けませんが、書き込みはまず状態の下のすべての view に「古いかもしれない」と印を付け、変わらない bucket に行き着く前にそれぞれの view を確かめます。Redux は書き込みのたびにすべての購読者を呼びます。Preact Signals、Solid、MobX、Jotai、Redux、そして `distinctUntilChanged` なしの RxJS の行は、$W$ とともに伸びます。

### 実装

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

#### RxJS（`distinctUntilChanged`）

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

#### RxJS（素朴な書き方、`distinctUntilChanged` なし）

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

## 計測の方法

- **回数**: 最初の 3 つのシナリオは、$N = 100{,}000$ 回の書き込みを計測なしで 5 回、計測ありで 20 回実行します。表の中央値、p95、1 秒あたりの更新は、計測した 60 回（20 回のプロセスを 3 つ）すべてから求めます。ほかのシナリオは各点を計測なしで 2 回、計測ありで最大 5 回実行し、プロセスごとの中央値の中央値を示します。
- **打ち切り**: 1 回の計測で <!-- benchmark:timeout -->5,000<!-- /benchmark --> ms を超えた実行があると、その点はそこで打ち切り、その回ではそれより大きな点を計りません（深いチェーンでは $K$ と $M$ がどちらも同じか大きい点）。3 回の計測のうち過半数で終わらなかった点を `>` で示します。
- **プロセスを分ける**: 各ライブラリは専用の Node.js プロセスで、順番を変えながら 3 回計ります。V8 は関数を見てきた形に合わせて最適化するので、同じプロセスでは前のライブラリが教えたことを後のライブラリが引き継いでしまいます。
- **計る前に確かめる**: 各ライブラリの結果は、計る前に正しいかを確かめます。何も計算しないライブラリを速いライブラリとして計らないためです。
- **ビルド**: `NODE_ENV=production` で動かし、どのライブラリも開発時だけの検査を行いません。Valtio の ES モジュールのビルドは Node が定義しない `import.meta.env.MODE` を読みますが、その開発時の検査が走るのは購読するときで、書き込みごとではありません。

### 比較を公平に保つために

- **Zustand** と **Valtio** は単一の状態だけに参加します。どちらも素の API に派生値がないので、ほかのシナリオでは購読者の中で値を計算するしかなく、ほかのライブラリが作るものより小さなグラフになってしまいます。
- **Redux**: 既定のミドルウェアは開発の補助なので外しています。深いチェーンと条件付きの分岐では、reducer を `createSlice` ではなく素の関数にしています。$M$ 個の点や $B$ 個の分岐の Immer の draft を作ると、Immer を計ることになるからです。selector は自分の前の出力を読めないので、深いチェーンは reducer の中のループです。
- **MobX** と **Preact Signals**（深いチェーン）: `computed` は前の値を受け取らないので、各段は box や signal で、1 つの reaction や effect が batch の中でまとめて進めます。**Solid** の段は、前の値を受け取る memo です。
- **Solid**: シナリオはクライアント向けのビルド `solid-js/dist/solid.js` を import します。Node では `solid-js` がサーバー向けのビルドに解決され、そこでは effect が動かないからです。
- **RxJS**: 合流は `combineLatest` と `map` で、これが RxJS での書き方です。変わらない値のシナリオでは、`bucket` を `shareReplay({ bufferSize: 1, refCount: true })` で共有し、すべての view にとって 1 つのノードにしています。
- **素朴な行**: 条件付きの分岐では、synstate-next と RxJS をすべての分岐にわたる `derive` や `combineLatest` でも書いています。変わらない値のシナリオでは、RxJS を `distinctUntilChanged` なしでも書いています。これらの行はその書き方のコストを示すもので、どちらのライブラリの使い方でもなく、まとめからは外しています。
- 深いチェーン以外では、どのライブラリも計る関数の中でグラフを作るので、作る時間も含まれます。
