---
title: 応用例
description: SynState の応用パターン — 派生状態、イベントエミッター、リデューサー、複雑なリアクティブパイプライン。
sidebar:
    order: 2
---

## debounce 付き検索

`switchMap` を使用した、自動キャンセル機能付きの debounce 検索パイプライン：

```tsx
import type * as React from 'react';
import {
    createState,
    debounce,
    filter,
    fromAbortablePromise,
    type InitializedObservable,
    map,
    switchMap,
    withInitialValue,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Result } from 'ts-data-forge';

const [searchState, setSearchState] = createState('');

// Advanced reactive pipeline with debounce and filtering
const searchResults$: InitializedObservable<
    readonly Readonly<{ id: string; name: string }>[]
> = searchState
    .pipe(debounce(300))
    .pipe(filter((query) => query.length > 2))
    .pipe(
        switchMap((query) =>
            fromAbortablePromise((signal) =>
                fetch(`/api/search?q=${query}`, { signal }).then(
                    (r) =>
                        r.json() as Promise<
                            readonly Readonly<{ id: string; name: string }>[]
                        >,
                ),
            ),
        ),
    )
    .pipe(filter((res) => Result.isOk(res)))
    .pipe(map((res) => Result.unwrapOk(res)))
    .pipe(withInitialValue([]));

const SearchBox = (): React.JSX.Element => {
    const searchResults = useObservableValue(searchResults$);

    return (
        <div>
            <input
                placeholder={'Search...'}
                onChange={(e) => {
                    setSearchState(e.target.value);
                }}
            />
            <ul>
                {searchResults.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
};
```

## throttle 付きイベントエミッター

値を持たない Observable を作成するには、`createEventEmitter` API を使用します。

```tsx
import { createEventEmitter, throttle } from 'synstate';

// Create event emitter
const [refreshClicked, onRefreshClick] = createEventEmitter();
// refreshClicked: Observable<void>
// onRefreshClick: () => void

// Subscribe to events
refreshClicked.subscribe(() => {
    console.log('Refresh Clicked');
});

// Throttle refresh clicks to prevent rapid successive executions
const throttledRefresh = refreshClicked.pipe(throttle(2000));

throttledRefresh.subscribe(() => {
    console.log('Executing refresh...');
    // Actual refresh logic here
    // This will be called at most once every 2 seconds
});

const DataTable = (): React.JSX.Element => (
    <div>
        <button onClick={onRefreshClick}>{'Refresh'}</button>
        <p>
            {'Data: '}
            {/* Display data here */}
        </p>
    </div>
);
```

## 追加 API を使ったシンプルな状態管理

```tsx
// Create a reactive state
const [
    state,
    setState,
    { updateState, resetState, getSnapshot, initialState },
] = createState(0);
// type of state: InitializedObservable<number>
// type of setState: (v: number) => number
// type of updateState: (updater: (prev: number) => number) => number
// type of resetState: () => void
// type of getSnapshot: () => number
// type of initialState: number

const stateHistory: number[] = [];

// Subscribe to changes
state.subscribe((count) => {
    stateHistory.push(count);
});

assert.deepStrictEqual(stateHistory, [0]);

assert.strictEqual(getSnapshot(), 0);

// Update state
setState(1);

assert.strictEqual(getSnapshot(), 1);

assert.deepStrictEqual(stateHistory, [0, 1]);

updateState((prev) => prev + 2);

assert.strictEqual(getSnapshot(), 3);

assert.deepStrictEqual(stateHistory, [0, 1, 3]);

resetState();

assert.strictEqual(getSnapshot(), 0);

assert.strictEqual(initialState, 0);

assert.deepStrictEqual(stateHistory, [0, 1, 3, 0]);
```
