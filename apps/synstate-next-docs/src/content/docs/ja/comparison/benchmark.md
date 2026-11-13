---
title: ベンチマーク
description: synstate-next が更新を伝えるのにかかる時間を、RxJS、MobX、Jotai、Redux、Solid、Preact Signals、Zustand、Valtio と並べ、7 つの形のグラフで計ります。
---

このページでは、synstate-next とほかの 8 つの状態ライブラリを同じグラフで計ります。単一の状態、小さな派生のグラフ、長いチェーン、連なったダイヤモンド、誰も読まない分岐、そしてめったに変わらない値とその下の多くの読み手です。各シナリオは 1 つの形のグラフについて 1 つのことを問うものなので、ライブラリはシナリオの中で比べ、シナリオをまたいでは比べないでください。

## まとめ

<!-- benchmark:summary -->

| シナリオ                                             | 最速                        | synstate-next ÷ 最速 | 最遅  | 最遅 ÷ 最速 | synstate-next ÷ synstate |
| :--------------------------------------------------- | :-------------------------- | -------------------: | :---- | ----------: | -----------------------: |
| [単一の状態](#単一の状態)                            | RxJS                        |                 1.7× | Jotai |         42× |                     1.2× |
| [派生のチェーン](#派生のチェーン)                    | RxJS                        |                 2.1× | Jotai |        102× |                     1.1× |
| [ダイヤモンド](#ダイヤモンド)                        | RxJS                        |                 1.1× | Jotai |         60× |                     0.8× |
| [深いチェーン](#深いチェーン) (K=1000, M=200)        | Redux                       |                 2.3× | RxJS  |        200× |                     0.8× |
| [連なったダイヤモンド](#連なったダイヤモンド) (N=20) | synstate-next               |                 1.0× | RxJS  |   > 19,082× |                     0.7× |
| [条件付きの分岐](#条件付きの分岐) (B=1000)           | Solid                       |                 1.8× | Redux |        210× |                     0.6× |
| [変わらない値](#変わらない値) (W=50)                 | RxJS (distinctUntilChanged) |                 1.4× | Redux |        527× |                     1.1× |

<!-- /benchmark -->

synstate-next は、どのシナリオでもそこで最速のライブラリの <!-- benchmark:subject-worst-over-fastest -->2.3×<!-- /benchmark --> を超える時間はかかりません。一方、各シナリオで最も遅いライブラリは、少なくとも <!-- benchmark:slowest-over-fastest-least -->42×<!-- /benchmark --> の時間がかかります。`>` の付いた比は、<!-- benchmark:timeout -->5,000<!-- /benchmark --> ms 以内に終わらなかったライブラリのもので、ちょうどその時間かかったものとして数えています。

同じ値を逆から読むと、各ライブラリの最悪の場合が分かります。最速のライブラリから最も離れるシナリオと、その差です。

<!-- benchmark:worst -->

| ライブラリ        | 最も遅れるシナリオ                                   | そこでの最速                | ライブラリ ÷ 最速 |
| :---------------- | :--------------------------------------------------- | :-------------------------- | ----------------: |
| **synstate-next** | [深いチェーン](#深いチェーン) (K=1000, M=200)        | Redux                       |              2.3× |
| RxJS              | [連なったダイヤモンド](#連なったダイヤモンド) (N=20) | synstate-next               |         > 19,082× |
| MobX              | [深いチェーン](#深いチェーン) (K=1000, M=200)        | Redux                       |              122× |
| Jotai             | [変わらない値](#変わらない値) (W=50)                 | RxJS (distinctUntilChanged) |              260× |
| Redux             | [変わらない値](#変わらない値) (W=50)                 | RxJS (distinctUntilChanged) |              527× |
| Solid             | [変わらない値](#変わらない値) (W=50)                 | RxJS (distinctUntilChanged) |               45× |
| Preact Signals    | [変わらない値](#変わらない値) (W=50)                 | RxJS (distinctUntilChanged) |               18× |
| Zustand           | [単一の状態](#単一の状態)                            | RxJS                        |              1.3× |
| Valtio            | [単一の状態](#単一の状態)                            | RxJS                        |               11× |

<!-- /benchmark -->

synstate-next が最も遅れるのは <!-- benchmark:subject-worst-scenario -->[深いチェーン](#深いチェーン) (K=1000, M=200)<!-- /benchmark --> です。7 つすべてのシナリオで計ったほかのライブラリは、最悪の場合にどれも最速の <!-- benchmark:others-worst-least -->18×<!-- /benchmark --> 以上です。Zustand と Valtio は単一の状態だけに参加しているので（[比較を公平に保つために](#比較を公平に保つために)）、最悪の場合もそのシナリオだけで見ています。条件付きの分岐では、synstate-next と RxJS は `switchMap` で書いたものを数えます。素朴に書いた行はそのシナリオには載せていますが、このまとめからは外しています。

どのシナリオでも、synstate-next が置き換える予定のライブラリである synstate も、同じ実行の中で、synstate 自身のドキュメントのベンチマークと同じコードで計ります。その行は書き直しで何が変わったかを示します。まとめの最後の列は synstate-next の時間を synstate の時間で割ったもので、1.0× より小さければ速くなっています。synstate は同じライブラリの前の世代なので、最速、最遅、最悪の場合からは外しています。

:::note[この値の作り方]
`pnpm --filter synstate-next-docs run benchmark` がすべてのシナリオを計り、このページの表と数値を書き換えます。載せている値は、これを GitHub のホストするランナーで動かす `synstate-next-benchmark.yml` ワークフローで計ったもので、ライブラリ間の比が synstate のドキュメントと同じ種類のマシンのものになるようにしています。各ライブラリはそれぞれ専用の Node.js プロセスで <!-- benchmark:rounds -->7<!-- /benchmark --> 回計り、どのライブラリも本番モードで動かします。新しい計測でこのページの文が成り立たなくなると、コマンドはその文を挙げて止まります。コードは[ドキュメントのパッケージ](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-next-docs/scripts/benchmark)にあります。

<!-- benchmark:environment -->

|            |                                                                                                                                                          |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実行環境   | GitHub Actions (ubuntu24)                                                                                                                                |
| Node.js    | v26.13.0                                                                                                                                                 |
| OS         | Linux 7.0.0-1017-azure (x64)                                                                                                                             |
| CPU        | AMD EPYC 7763 64-Core Processor                                                                                                                          |
| ライブラリ | synstate 8.0.0, rxjs 7.8.2, mobx 7.1.0, jotai 3.0.1, @reduxjs/toolkit 2.13.0, solid-js 1.9.17, @preact/signals-core 1.14.4, zustand 5.0.15, valtio 2.3.2 |
| 計測日     | 2026-11-12                                                                                                                                               |

<!-- /benchmark -->

ミリ秒の値は同じマシンの中でしか比べられません。手元の計測と比べるときは、ライブラリ同士の比を比べてください。
:::

## 単一の状態

状態が 1 つ、購読者が 1 つで、派生値はありません。ほかのすべてのシナリオの土台で、Zustand と Valtio が参加する唯一のシナリオです。状態に $N = 100{,}000$ 回書き込み、購読者は値を毎回記録します。

<!-- benchmark:results/single-state -->

| ライブラリ        | 中央値 (ms) | p95 (ms) | 1 秒あたりの更新 | ÷ synstate-next |
| :---------------- | ----------: | -------: | ---------------: | --------------: |
| **synstate-next** |        7.09 |     7.42 |       14,111,559 |            1.0× |
| synstate          |        5.68 |     6.65 |       17,618,812 |            0.8× |
| RxJS              |        4.26 |     4.45 |       23,476,140 |            0.6× |
| MobX              |        57.2 |     59.4 |        1,749,330 |            8.1× |
| Jotai             |         181 |      185 |          553,011 |             26× |
| Redux             |         118 |      123 |          845,495 |             17× |
| Solid             |        28.8 |     31.7 |        3,477,704 |            4.1× |
| Preact Signals    |        5.33 |     5.68 |       18,758,720 |            0.8× |
| Zustand           |        5.58 |     6.45 |       17,928,862 |            0.8× |
| Valtio            |        46.8 |     47.7 |        2,137,397 |            6.6× |

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
| **synstate-next** |        15.8 |     18.1 |        6,346,503 |            1.0× |
| synstate          |        15.0 |     17.2 |        6,667,307 |            1.0× |
| RxJS              |        7.33 |     7.68 |       13,644,575 |            0.5× |
| MobX              |         111 |      113 |          900,280 |            7.0× |
| Jotai             |         749 |      769 |          133,526 |             48× |
| Redux             |         289 |      304 |          345,779 |             18× |
| Solid             |        87.5 |     89.4 |        1,143,379 |            5.6× |
| Preact Signals    |        15.0 |     17.2 |        6,665,744 |            1.0× |

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
| **synstate-next** |        21.2 |     22.1 |        4,727,067 |            1.0× |
| synstate          |        25.4 |     31.5 |        3,941,890 |            1.2× |
| RxJS              |        18.4 |     19.0 |        5,429,040 |            0.9× |
| MobX              |         143 |      146 |          698,530 |            6.8× |
| Jotai             |       1,106 |    1,121 |           90,424 |             52× |
| Redux             |         362 |      384 |          276,237 |             17× |
| Solid             |         108 |      115 |          923,381 |            5.1× |
| Preact Signals    |        22.3 |     23.9 |        4,479,429 |            1.1× |

<!-- /benchmark -->

### 最初の 3 つのシナリオから分かること

小さなグラフでは、時間のほとんどはライブラリが書き込みごとに行う処理で、synstate-next はどのシナリオでも最速のライブラリの <!-- benchmark:small-graphs-subject-over-fastest-max -->2.1×<!-- /benchmark --> 以内に収まります。最速のライブラリは書き込みごとの処理が少ないものです。RxJS は値をそのまま次の `subscribe` に渡し、更新の順番を整える手順を持ちません。ダイヤモンドで購読者が古い値と新しい値の混ざった組み合わせを見るのもそのためです。Preact Signals は、何かが読むまで値を計算しません。synstate-next は書き込みが届くすべての値を親から子の順に計算してから購読者を呼ぶので、どの購読者もすべての値が最新の状態を見て、呼ばれるのは 1 回です。Solid、MobX、Jotai、Redux は 3 つすべてで synstate-next より時間がかかります。

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
| **synstate-next** |             0.96 |             1.80 |              3.31 |              0.55 |              2.99 |               5.89 |              5.85 |               11.9 |
| synstate          |             1.42 |             3.39 |              3.66 |              0.66 |              3.74 |               7.48 |              7.17 |               14.4 |
| RxJS              |             7.61 |             30.6 |              56.3 |              22.5 |               130 |                238 |               508 |              1,031 |
| MobX              |             16.8 |             79.6 |               158 |              31.8 |               157 |                317 |               314 |                628 |
| Jotai             |             23.5 |             99.5 |               198 |              39.3 |               197 |                395 |               404 |                802 |
| Redux             |             0.71 |             3.16 |              4.64 |              0.76 |              4.25 |               5.61 |              7.35 |               5.15 |
| Solid             |             3.48 |             6.52 |              12.8 |              2.45 |              12.4 |               28.4 |              27.9 |               55.3 |
| Preact Signals    |             1.63 |             1.60 |              2.96 |              0.50 |              2.46 |               8.54 |              8.28 |               17.2 |

<!-- /benchmark -->

### 結果から分かること

チェーンを 4 倍深くすると（$K = 1000$ で $M = 50 \to 200$）、synstate-next の時間は <!-- benchmark:deep-chain-subject-growth -->3.6×<!-- /benchmark -->、RxJS は <!-- benchmark:deep-chain-rxjs-growth -->18×<!-- /benchmark --> になります。チェーンが深くなったときに時間が最も伸びるのは RxJS です。synstate-next は 1 回の移動で各段を 1 回だけ計算し、購読者を 1 回呼びます。RxJS の `combineLatest` は $M + 1$ 個の入力のどれかが動くたびに値を出すので、購読者は 1 回の移動で $M + 1$ 回、毎回 $M + 1$ 個の点とともに呼ばれます。Redux、MobX、Preact Signals は reducer、reaction、effect の中のループでチェーン全体を進めるので、これらの行は派生値のチェーンではなくループを計っています（[比較を公平に保つために](#比較を公平に保つために)）。

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
| **synstate-next** |     0.23 |     0.17 |     0.40 |     0.34 |      0.36 |      0.19 |      0.19 |      0.23 |      0.26 |      0.26 |
| synstate          |     0.42 |     0.22 |     0.58 |     0.78 |      0.89 |      0.53 |      0.30 |      0.35 |      0.38 |      0.40 |
| RxJS              |     0.23 |     1.39 |     3.80 |     25.8 |       132 |       702 |   > 5,000 |   > 5,000 |   > 5,000 |   > 5,000 |
| MobX              |     0.88 |     1.74 |     1.18 |     0.98 |      0.78 |      0.89 |      1.00 |      1.12 |      1.24 |      1.39 |
| Jotai             |     4.23 |     5.15 |     7.58 |     9.23 |      12.4 |      10.1 |      11.7 |      13.4 |      19.2 |      21.1 |
| Redux             |     1.75 |     1.18 |     1.38 |     1.80 |      1.97 |      3.09 |      2.72 |      3.08 |      3.38 |      3.80 |
| Solid             |     0.52 |     0.73 |     1.65 |     1.41 |      1.14 |      0.84 |      0.96 |      1.09 |      1.23 |      1.36 |
| Preact Signals    |     0.16 |     0.25 |     0.37 |     0.46 |      0.45 |      0.44 |      0.37 |      0.28 |      0.33 |      0.36 |

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

### 結果から分かること

`switchMap` で書くと、synstate-next の時間は $B$ が増えても伸びません。`switchMap` は選ばれた分岐だけを追うので、分岐 1 への書き込みはどこにも届かず、どの $B$ でも <!-- benchmark:fan-out-switch-map-range -->1.13–1.42<!-- /benchmark --> ms に収まります。読んだものだけを追う MobX、Solid、Preact Signals と同じです。すべての分岐にわたる `derive` で素朴に書くと、書き込みのたびに $B$ 個すべての値から `derive` を計算し直し、<!-- benchmark:fan-out-summary-point -->$B = 1000$<!-- /benchmark --> では最速のライブラリの <!-- benchmark:fan-out-naive-over-fastest -->472×<!-- /benchmark --> の時間がかかります。このシナリオはセレクターを変えないので、分岐を切り替えるコストは計っていません。

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

### 結果から分かること

synstate-next の `map` は bucket を前の値と比べ、変わらない値はそこで止まります。1000 回の書き込みのうち 999 回はどの view にも届かず、$W = 1$ から $W = 1000$ まで時間は <!-- benchmark:unchanged-subject-range -->10.2–19.9<!-- /benchmark --> ms に収まります。`distinctUntilChanged` を付けた RxJS も同じです。Preact Signals、Solid、MobX、Jotai も変わらない値を購読者には届けませんが、書き込みはまず状態の下のすべての view に「古いかもしれない」と印を付け、変わらない bucket に行き着く前にそれぞれの view を確かめます。Redux は書き込みのたびにすべての購読者を呼びます。Preact Signals、Solid、MobX、Jotai、Redux、そして `distinctUntilChanged` なしの RxJS の行は、$W$ とともに伸びます。

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

- **回数**: 最初の 3 つのシナリオは、$N = 100{,}000$ 回の書き込みを計測なしで 5 回、計測ありで 20 回実行します。表の中央値、p95、1 秒あたりの更新は、計測した <!-- benchmark:stats-runs -->140<!-- /benchmark --> 回（20 回のプロセスを <!-- benchmark:rounds -->7<!-- /benchmark --> つ）すべてから求めます。ほかのシナリオは各点を計測なしで 2 回、計測ありで最大 5 回実行し、プロセスごとの中央値の中央値を示します。
- **打ち切り**: 1 回の計測で <!-- benchmark:timeout -->5,000<!-- /benchmark --> ms を超えた実行があると、その点はそこで打ち切り、その回ではそれより大きな点を計りません（深いチェーンでは $K$ と $M$ がどちらも同じか大きい点）。<!-- benchmark:rounds -->7<!-- /benchmark --> 回の計測のうち過半数で終わらなかった点を `>` で示します。
- **プロセスを分ける**: 各ライブラリは専用の Node.js プロセスで、順番を変えながら <!-- benchmark:rounds -->7<!-- /benchmark --> 回計ります。V8 は関数を見てきた形に合わせて最適化するので、同じプロセスでは前のライブラリが教えたことを後のライブラリが引き継いでしまいます。
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
