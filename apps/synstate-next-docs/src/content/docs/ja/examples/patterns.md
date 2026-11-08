---
title: パターン
description: キャンセル付きのデバウンス検索、間引いた更新ボタン、reducer と派生ビューを持つ ToDo リスト。
---

## デバウンス付きの検索

不要になったリクエストをキャンセルし、リクエストが失敗したら直前の結果を保ち、空のリストから始まるデバウンス検索です。

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

const responses = query.pipe(
    debounce(300),
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

const results: InitializedObservable<readonly Item[]> = responses.pipe(
    // A failed request leaves the results as they were.
    filter(Result.isOk),
    map((result) => result.value),
    // The empty query has answered `[]` already, but `switchMap`'s type
    // says it may hold nothing: name the list it starts with.
    withInitialValue<readonly Item[]>([]),
);
```

検索するには短すぎるクエリも `switchMap` を通して空の答えにします。その前で `filter` で落とすと、長いクエリのリクエストが走り続けてしまいます。結果は `InitializedObservable` なので、ビューは最初から `results.value` を読めます。synstate-dom-next なら、`For` がそのままリストに束縛します。

## 間引いた更新ボタン

`createEventEmitter` は、値を持たないイベントとそれを発火する関数を返します。ボタンの `onClick` が受け取るのはこの関数です。

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

## ToDo リスト

リストのための reducer、フィルターのための状態、2 つの派生ビューです。どちらのビューも 1 回の更新で両方の親から 1 回だけ計算され、変わらなければ打ち切られます。

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
