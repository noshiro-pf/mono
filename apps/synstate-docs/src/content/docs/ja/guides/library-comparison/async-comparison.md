---
title: 非同期処理の比較
description: debounce、キャンセル、ローディングとエラーの状態、破棄までを備えた本番品質の検索ボックスを、SynState・RxJS・MobX・Jotai・Redux Toolkit・Solid・Preact Signals で書き比べます。
sidebar:
    order: 7
---

[宣言的な状態管理](/mono/synstate/ja/guides/declarative-state-management/#非同期処理の正確な制御)では、`debounce`・`switchMap`・`fromAbortablePromise` による SynState のパイプラインを、React の `useEffect` で書いた同じ検索ボックスと比べました。このページでは、その検索ボックスを[ベンチマーク](/mono/synstate/ja/guides/library-comparison/benchmark/)が派生グラフで計測している各ライブラリで、本番コードに必要な水準まで書きます。そうすると残る違いは、各ライブラリが何を提供し、何を自分で書くことになるかです（単一ステートでのみ計測している Zustand と Valtio には、比べるべき派生や非同期のプリミティブがありません）。

## 仕様

このページの実装はどれも次のすべてを満たし、それぞれが同じテストスイート（`libs/synstate/samples/docs-site/async-comparison/search-test-suite.mts`、フェイクタイマーとフェイクの `fetch` を使用）を自身に対して実行しています。

1. **debounce**：入力が 300 ms 止まってから初めてリクエストを送る。
2. **正規化と重複排除**：クエリを trim し、同じクエリを続けて2回送らない（debounce 後に比べるので、入力が止まる前に書き換えて元に戻したクエリは送り直さない）。そのため、失敗したクエリの再試行はリトライ用の操作に任せることになり、このページでは扱いません。
3. **空のクエリ**：空白だけのクエリでは何も表示せず（`idle`）、実行中のリクエストをキャンセルする。
4. **置き換えられたリクエストのキャンセル**：新しいクエリは前のリクエストを `AbortSignal` で中断し、前のリクエストが返すものは何も表示しない。
5. **ローディング状態**：リクエストを送った時点から `loading`。
6. **エラー**：HTTP エラー、ネットワークエラー、不正な形式のレスポンスはそれぞれ `error` を表示し、次のクエリで回復する。
7. **破棄**：検索ボックスを破棄すると、実行中のリクエストを中断し、入力の停止を待っているクエリを捨てる。

テストスイートはこれらの境目も確かめています。空白を1つ打っただけでも待ち直すこと、実行中のクエリまで入力を戻せばそのリクエストを続けること、置き換えられたリクエストや破棄後のリクエストが返すものを表示しないことです。どのケースも、`fetch` と、signal を無視してそのまま応答する Promise API の2通りで実行します。

生成する状態と送るリクエストはライブラリに依存しないので共通です。

```tsx
export type Item = Readonly<{ id: string; title: string }>;

/** 検索ボックスが表示するもの。このページのすべての実装がこれを生成する。 */
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

/** 2xx 以外のステータスと、アイテムの配列でないボディで reject する。 */
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

/** `signal` が中断されると `fetch` は `AbortError` で reject する。 */
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

各実装は `createSearch()` というファクトリにしてあり、テストごとに新しいものを作れるようにしています。ページと同じだけ生きる検索ボックスなら、同じコードをモジュールスコープで1回実行するだけです。各リストからは import と、各サンプルがテストスイートに渡すアダプターを省いています。

## 一覧

各要件について各ライブラリが提供するもの、および以下のコードで手書きしている箇所です。

| 要件                             | SynState                             | RxJS                                 | MobX                                      | Jotai                                               | Redux Toolkit                         | Solid                       | Preact Signals                    |
| :------------------------------- | :----------------------------------- | :----------------------------------- | :---------------------------------------- | :-------------------------------------------------- | :------------------------------------ | :-------------------------- | :-------------------------------- |
| debounce                         | `debounce`                           | `debounceTime`                       | 手書き[^mobx-delay]                       | 手書き                                              | `cancelActiveListeners()` + `delay()` | 手書き（`onCleanup`）       | 手書き（effect のクリーンアップ） |
| 変わっていないクエリを飛ばす     | `map`（変化したときだけ流す）        | `distinctUntilChanged`               | 手書き                                    | atom の等価判定                                     | 手書き（ストアの値と比較）            | signal の等価判定           | signal の等価判定                 |
| 置き換えられたリクエストの中断   | `switchMap` + `fromAbortablePromise` | `switchMap` + `fromFetch`[^rx-fetch] | 手書き                                    | read の `signal`                                    | listener の `signal`                  | 手書き[^solid-signal]       | 手書き（effect のクリーンアップ） |
| そのリクエストの結果を反映しない | 組み込み                             | 組み込み                             | 手書き（`signal.aborted`）                | 組み込み（破棄時は手書き）                          | 手書き（`signal.aborted`）            | 組み込み                    | 手書き（`signal.aborted`）        |
| ローディング状態                 | `withInitialValue`                   | `startWith`                          | 手書きで設定                              | `unwrap` + 派生 atom                                | アクション                            | `resource.state`            | 手書きで設定                      |
| エラー                           | 値（`Result`）                       | `switchMap` の内側の `catchError`    | `catch`                                   | read 内の `catch`                                   | listener 内の `catch`                 | `resource.state`            | `catch`                           |
| 破棄                             | `scope.dispose()`                    | `unsubscribe()`、`complete()`        | reaction・タイマー・controller を手書きで | 購読・タイマー・controller を手書きで[^jotai-abort] | `clearListeners()`                    | `createRoot` の `dispose()` | 2つの effect の disposer          |
| 購読される前から動く             | はい                                 | いいえ（コールド）                   | はい                                      | いいえ（遅延）                                      | はい                                  | はい                        | はい                              |

[^mobx-delay]: `reaction` の `delay` オプションは、最初の変更から `delay` ms 後に effect を実行し、その後の変更では待ち直さないので、debounce ではなく throttle になります。

[^rx-fetch]: `fromFetch` は自分が開始した `fetch` を中断します。`AbortSignal` を受け取る他の Promise API（SDK、`IndexedDB` のラッパーなど）には、`AbortController` を使って `new Observable` を自分で書く必要があります。

[^solid-signal]: `createResource` は古いレスポンスを無視しますが、Solid 1.x では fetcher に `AbortSignal` を渡しません。

[^jotai-abort]: Jotai が read の `signal` を中断するのは、依存が変わって atom が再び読まれたときで、最後の購読者が離れたときではありません。

各実装のコードの後の要点では、長所を ✅、短所を ⚠️、トレードオフや補足を ℹ️ で示します。

## SynState

```tsx
export const createSearch = () => {
    // `run` の中で作ったものはすべて `scope.dispose()` で破棄される。
    // ページと同じだけ生きる検索ボックスなら scope は要らない。
    const scope = createScope();

    return scope.run(() => {
        const [query, setQuery] = createState('');

        const searchState = query
            .pipe(debounce(debounceMs)) // 入力が止まるのを待つ
            .pipe(map((q) => q.trim())) // map は変化したクエリだけを流す
            .pipe(
                // 新しいクエリが前の内部 Observable を complete し、
                // complete によってそのリクエストが中断される。
                switchMap((q): Observable<SearchState> =>
                    q === ''
                        ? just(idleState)
                        : fromAbortablePromise((signal) =>
                              fetchItems(q, signal),
                          )
                              .pipe(
                                  // reject は値として届く：Result.err(error)
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
                                  // リクエストの開始と同時に発行される
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

- ✅ **要件ごとに1つの演算子**を1本のパイプラインに並べ、クエリが通る順に上から下へ読めます。要件を足す（最小文字数、リトライなど）なら `pipe` が1つ増えるだけです。
- ✅ **`map` が重複を排除します。** 結果が前回と異なるとき（`Object.is`）だけ流すので、trim したクエリの後に `skipIfNoChange` は要りません。
- ✅ **キャンセルはコードではなく構造で決まります。** `switchMap` が前の内部 Observable を complete し、`fromAbortablePromise` は complete されると自身の `AbortController` を中断し、その後に来る `AbortError` は握りつぶされます。`signal.aborted` を確かめるコードはありません。
- ✅ **エラーは値です。** `fromAbortablePromise` は `Result.ok` か `Result.err` を発行し、パイプラインに例外を投げないので、エラーをどこで扱っても、リクエストの失敗でパイプラインが終わることはありません。
- ✅ **`searchState` は常に値を持ち**、`getSnapshot()` や `useObservableValue` で読めます。パイプラインは購読の有無にかかわらず動きます。
- ✅ **破棄は complete ではなく dispose です。** `scope.dispose()` は `debounce` が保留中のクエリを発行せずに捨て、実行中のリクエストを中断します。
- ⚠️ **演算子を覚える必要があります。** パイプラインを読むには、RxJS と同じく `debounce`、`switchMap`、`fromAbortablePromise` が何を保証するかを知らなければなりません。

## RxJS

```tsx
export const createSearch = () => {
    const query$ = new Subject<string>();

    // RxJS の Observable は現在値を持たない。BehaviorSubject が保持する。
    const searchState$ = new BehaviorSubject<SearchState>(idleState);

    const subscription = query$
        .pipe(
            debounceTime(debounceMs), // 入力が止まるのを待つ
            map((q) => q.trim()),
            distinctUntilChanged(), // 変わっていないクエリは飛ばす
            // 新しいクエリは前のリクエストの購読を解除し、
            // fromFetch は購読解除されたリクエストを中断する。
            switchMap((q): Observable<SearchState> =>
                q === ''
                    ? of(idleState)
                    : fromFetch(searchUrl(q), { selector: parseResponse }).pipe(
                          map((items): SearchState => ({
                              status: 'success',
                              query: q,
                              items,
                          })),
                          // switchMap の内側で捕捉する。外側のパイプに届いたエラーは
                          // パイプを終わらせ、検索ボックスも止まる。
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

- ℹ️ **SynState と同じ語彙**で、長さも同程度です。違いは演算子が何を保証するかにあります。
- ⚠️ **`catchError` を置く位置で、検索ボックスが最初のエラーを生き延びるかが決まります。** `switchMap` の内側なら失敗したリクエストを置き換えますが、1段外に置くとエラーが外側のパイプを終わらせ、以後のクエリはずっと無視されます。どちらの位置も型エラーにはなりません。
- ⚠️ **現在値を持ちません。** `BehaviorSubject`（または `shareReplay`）が保持するまで、現在値はありません。
- ℹ️ **購読されるまで何も動かず**、コールドなパイプラインでは購読者ごとにリクエストが送られます。そのためコードは1回だけ購読して `BehaviorSubject` を渡しています。
- ⚠️ **`fromFetch` が扱えるのは `fetch` だけです。** SynState の `fromAbortablePromise` は任意の `(signal) => Promise` を受け取ります。
- ⚠️ **派生値はグリッチフリーではありません。** 検索ボックス単体にはダイヤモンドはありませんが、同じソースから派生した2つの値を何かが組み合わせると、RxJS は経路ごとに1回ずつ発行し、最初の発行では入力の一方が古いままです（[SynState がグリッチを解決した方法](/mono/synstate/ja/internals/how-synstate-solved-the-glitch/)）。

## MobX

```tsx
export const createSearch = () => {
    const query = observable.box('');

    // `deep: false`：状態は丸ごと置き換え、書き換えない。
    const searchState = observable.box<SearchState>(idleState, { deep: false });

    let mut_timer: ReturnType<typeof setTimeout> | undefined;

    let mut_controller: AbortController | undefined;

    let mut_lastQuery = '';

    const setSearchState = action((state: SearchState) => {
        searchState.set(state);
    });

    const search = (q: string): void => {
        mut_controller?.abort(); // このクエリが置き換えるリクエストをキャンセル

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
                // 置き換えられたリクエストは AbortError で reject される。何も反映しない。
                if (!controller.signal.aborted) {
                    setSearchState({
                        status: 'error',
                        query: q,
                        message: toErrorMessage(error),
                    });
                }
            });
    };

    // reaction の `delay` オプションは「最初の」変更から `delay` ms 後に
    // effect を実行するので throttle になる。debounce は手で書く。
    const disposeReaction = reaction(
        () => query.get(), // trim しない：空白の入力でも待ち直す
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

- ⚠️ **MobX が追跡するのは状態で、時間ではありません。** 「trim したクエリが変わった」より後はすべて命令的なコードです。タイマー、controller、古いレスポンスの確認、状態遷移がそうです。
- ⚠️ **重複排除には専用の変数が要ります。** `reaction` が比べるのは最後に「入力された」クエリですが、要件は debounce を通った最後のクエリについてのものだからです。
- ⚠️ **破棄で解放するものが3つ**あり、それぞれ別の変数にあります。1つ忘れるとタイマーかリクエストが動き続けます。

## Jotai

```tsx
export const createSearch = () => {
    const store = createStore();

    // プリミティブ atom は今の値と等しい書き込みを無視するので、
    // 変わっていないクエリは何も引き起こさない。
    const debouncedQueryAtom = atom('');

    // Jotai に debounce はない。キー入力のたびに待ち直すタイマーで書く。
    let mut_timer: ReturnType<typeof setTimeout> | undefined;

    const setQuery = (q: string): void => {
        clearTimeout(mut_timer);

        mut_timer = setTimeout(() => {
            store.set(debouncedQueryAtom, q.trim());
        }, debounceMs);
    };

    // 依存が変わって atom が再び読まれると、Jotai は `signal` を中断し、
    // 返された Promise を無視する。購読解除では中断されないので、
    // 破棄用に別の signal を用意する。
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

    // 非同期 atom はサスペンドする。unwrap は保留中の Promise を
    // フォールバック値に置き換えるが、それはクエリを持たない。
    const unwrappedAtom = unwrap(resultAtom, () => undefined);

    const searchStateAtom = atom(
        (get): SearchState =>
            get(unwrappedAtom) ?? {
                status: 'loading',
                query: get(debouncedQueryAtom),
            },
    );

    // atom が購読されるまで何も計算されず、リクエストも送られない
    // （コンポーネントでは useAtomValue がこれを行う）。
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

    // 中断された（破棄されたか、置き換えられてどのみち無視される）：何も新しく見せない。
    return signal.aborted ? { status: 'loading', query: q } : state;
};
```

- ✅ **キャンセルは組み込みで**、Observable 以外のライブラリの中では最も近いところまで来ています。read 関数は新しいクエリで中断される `signal` を受け取り、古い Promise の結果は表示されません。
- ⚠️ **Suspense を使わずにローディングを表すには atom が2つ要ります。** `unwrap` は保留中の Promise をフォールバック値に置き換えますが、フォールバックからはクエリが見えないので、派生 atom でクエリを加えています。空のクエリは `async` 関数からではなく同期的に返しています。そうしないと、それも Promise が決着するまで `loading` を表示してしまいます。
- ⚠️ **破棄には `AbortSignal.any` が要ります。** Jotai の signal と破棄用の signal をまとめるためで、Chrome 116、Firefox 124、Safari 17.4、Node 20.3 以降が必要です。
- ⚠️ **read の中で catch する必要があります。** reject した非同期 atom は読んだときに例外を投げ、React ではエラーバウンダリが必要になります。
- ℹ️ **購読されるまで何も動かない**のは Jotai の設計です。どのコンポーネントも読まない atom はコストがかからず、どのコンポーネントも読まない fetch は送られません。

## Redux Toolkit

```tsx
export const createSearch = () => {
    const listener =
        createListenerMiddleware<Readonly<{ search: SliceState }>>();

    // debounce：キー入力のたびに、`delay` で待機中の実行をキャンセルする。
    listener.startListening({
        actionCreator: queryChanged,
        effect: async (action, api) => {
            api.cancelActiveListeners();

            await api.delay(debounceMs); // この実行がキャンセルされると reject される

            const q = action.payload.trim();

            if (q !== api.getState().search.debouncedQuery) {
                api.dispatch(queryDebounced(q));
            }
        },
    });

    // fetch：キー入力でリクエストがキャンセルされないよう listener を分ける。
    // キャンセルするのは次の debounce 済みクエリだけで、`signal` の中断による。
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

                // キャンセルされた実行は、リクエストが中断前に決着していても、
                // 中断で reject されても、何も反映しない。
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
        // 実行中の listener をすべてキャンセルする：タイマーもリクエストも。
        dispose: () => {
            listener.clearListeners();
        },
    };
};

type SliceState = Readonly<{
    debouncedQuery: string;
    searchState: SearchState;
}>;

// これを読むのは debounce の listener だけで、reducer は読まない。
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

- ✅ **listener ミドルウェアは小さなタスクランナーです。** `cancelActiveListeners()` は前の実行をキャンセルし、その `delay()` を reject させ、`signal` を中断します。debounce もキャンセルもこれで組み立てています。
- ⚠️ **listener は2つ要ります。** 1つにすると、キーを押すたびに実行中のリクエストが中断され、実行中のクエリまで入力を戻すと、もう存在しないリクエストと比べて重複と判定され、`loading` が表示されたままになります。
- ℹ️ **遷移はすべてアクションです。** 検索ボックス1つにアクションが6種類と、保存しておく debounce 済みクエリが要ります。その代わり、Redux DevTools にそのすべてが表示されます。
- ℹ️ **RTK Query**（`createApi`）は引数ごとにリクエストをキャッシュし重複を除きますが、その引数を debounce するのはやはりアプリケーションの仕事です。このページで比べているのは各ライブラリ自身のプリミティブで、データ取得層ではありません。

## Solid

```tsx
export const createSearch = () =>
    createRoot((dispose) => {
        const [query, setQuery] = createSignal('');

        // signal は今の値と等しい書き込みを無視するので、
        // 変わっていないクエリは何も引き起こさない。
        const [debouncedQuery, setDebouncedQuery] = createSignal('');

        // debounce はない。クリーンアップでタイマーを解除する effect が
        // キー入力のたびに再実行される。
        createEffect(() => {
            const q = query().trim();

            const timer = setTimeout(() => setDebouncedQuery(q), debounceMs);

            onCleanup(() => {
                clearTimeout(timer);
            });
        });

        // createResource は古いレスポンスを無視するが、fetcher に AbortSignal を
        // 渡さない。クエリごとに controller を作り、クエリが変わったときと
        // root が破棄されたときに走るクリーンアップで中断する。
        const signal = createMemo(() => {
            debouncedQuery();

            const controller = new AbortController();

            onCleanup(() => {
                controller.abort();
            });

            return controller.signal;
        });

        // ソースが `false` なら何も fetch しない（そして最後の値を保持する）。
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

            // エラーになったリソースを読むと例外が投げられるので、先に state を確かめる。
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

- ✅ **`createResource` は Solid の非同期プリミティブで**、ローディングとエラーの状態、古いレスポンスを扱います。
- ⚠️ **その周りはすべて手書きです。** debounce、fetcher に渡されない `AbortController`、空のクエリ（`false` のソースは値をクリアせず最後の値を保持します）、そしてリソースの状態に必要な確認の順序です。
- ✅ **`onCleanup` のおかげで破棄は一様です。** `createRoot` の `dispose()` が、その下で登録されたすべてのクリーンアップを実行します。

## Preact Signals

```tsx
export const createSearch = () => {
    const query = signal('');

    // signal は今の値と等しい書き込みを無視するので、
    // 変わっていないクエリは何も引き起こさない。
    const debouncedQuery = signal('');

    const searchState = signal<SearchState>(idleState);

    // debounce はない。クリーンアップでタイマーを解除する effect が
    // キー入力のたびに再実行される。
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
                // 置き換えられたリクエストは AbortError で reject される。何も反映しない。
                if (!controller.signal.aborted) {
                    searchState.value = {
                        status: 'error',
                        query: q,
                        message: toErrorMessage(error),
                    };
                }
            });

        // クリーンアップは次のクエリでの実行の前と、dispose のときに走る。
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

- ✅ **このページで最も小さな API** で、`signal` と `effect` だけです。effect が返すクリーンアップは次の実行の前と dispose のときに実行され、debounce にも中断にもそれで足ります。
- ⚠️ **それ以外はすべて手書きです。** ローディング状態、古いレスポンスの確認、エラー状態は、effect の中から signal に書き込んで表します。

## 比較から分かること

- **signal とストアのライブラリでは、要件の1つ1つが自分で書いて自分で解放するコードになります。** タイマー、`AbortController`、`signal.aborted` の確認、状態遷移です。Jotai の `signal`、Solid の `createResource`、Redux Toolkit の listener ミドルウェアはそれぞれ1つか2つを肩代わりしますが、すべてを引き受けるものはありません。
- **2つの Observable ライブラリでは、要件の1つ1つが演算子になり**、次の要件も、同期を保つべき変数ではなくパイプラインの1行として加わります。
- **その2つの間での SynState の違いは、UI が頼りにするものです。** `BehaviorSubject` なしで持てる現在値、購読者なしで動き、すべての読み手で共有されるパイプライン、失敗でパイプラインが終わらない値としてのエラー、`fromAbortablePromise` による任意の Promise API のキャンセル、そしてグリッチフリーな派生値です。
- **SynState の代償**は、演算子の語彙そのもの、`switchMap` でクエリごとに作られる内部 Observable、そしてページより先に破棄しなければならないパイプラインのための `createScope` です。

各ライブラリが更新をどれだけ速く伝搬するかは別の問題で、それには[ベンチマーク](/mono/synstate/ja/guides/library-comparison/benchmark/)が答えます。
