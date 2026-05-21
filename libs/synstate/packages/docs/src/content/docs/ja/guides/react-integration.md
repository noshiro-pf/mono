---
title: React 連携
description: SynState を React と統合する方法 — useObservableValue、useObservableEffect などのフック API。
sidebar:
    order: 4
---

SynState は、シームレスな React 連携のためのコンパニオンパッケージ `synstate-react-hooks` を提供しています。

## インストール

```bash
npm add synstate-react-hooks
```

## 基本的な使い方

`synstate-react-hooks` の `createState` は、生の Observable の代わりに React hook を返します：

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

const [useUserState, setUserState] = createState({
    name: '',
    email: '',
});

const UserProfile = (): React.JSX.Element => {
    const user = useUserState();

    return (
        <div>
            <p>{`Name: ${user.name}`}</p>
            <button
                onClick={() => {
                    setUserState({
                        name: 'Alice',
                        email: 'alice@example.com',
                    });
                }}
            >
                {'Set User'}
            </button>
        </div>
    );
};
```

これは `synstate-react-hooks` を使用しない以下のコードと同等です：

```tsx
import * as React from 'react';
import { createState } from 'synstate';

const [userState, setUserState] = createState({
    name: '',
    email: '',
});

const UserProfile = (): React.JSX.Element => {
    const user = React.useSyncExternalStore(
        (onStoreChange: () => void) => {
            const { unsubscribe } = userState.subscribe(onStoreChange);

            return unsubscribe;
        },
        () => userState.getSnapshot().value,
    );

    return (
        <div>
            <p>{`Name: ${user.name}`}</p>
            <button
                onClick={() => {
                    setUserState({
                        name: 'Alice',
                        email: 'alice@example.com',
                    });
                }}
            >
                {'Set User'}
            </button>
        </div>
    );
};
```

## 追加ユーティリティ：3番目の要素

`synstate-react-hooks` の `createState` も、コアパッケージと同様に3要素のタプルを返します。3番目の要素には [createState 詳説](/synstate/ja/guides/core-state-management/) で説明されているものと同じユーティリティ（`updateState`、`resetState`、`getSnapshot`、`initialState`）に加え、コアライブラリの Observable である `state` が含まれています：

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// The third element provides additional utilities and the underlying Observable.
const [
    useCount,
    setCount,
    {
        state,
        updateState: updateCount,
        resetState: resetCount,
        getSnapshot: getCountSnapshot,
    },
] = createState(0);

const increment = (): void => {
    updateCount((n) => n + 1);
};

const Counter = (): React.JSX.Element => {
    const count = useCount();

    return (
        <div>
            <p>{`Count: ${count}`}</p>
            <button onClick={increment}>{'Increment'}</button>
            <button onClick={resetCount}>{'Reset'}</button>
        </div>
    );
};

// `state` is the same InitializedObservable<number> that the core
// synstate package's createState returns as its first element.
// You can use it with pipe, combine, subscribe, etc.
state.subscribe((value) => {
    console.log('count changed:', value);
});

// Read the current value synchronously (outside of React rendering)
console.log('current count:', getCountSnapshot());
```

| プロパティ     | 型                                | 説明                                                                                                                                           |
| :------------- | :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`        | `InitializedObservable<S>`        | コアの `synstate` パッケージの `createState` が第1要素として返すのと同じ Observable。`pipe`、`combine`、`subscribe` などと組み合わせて使用可能 |
| `updateState`  | `(updateFn: (prev: S) => S) => S` | 前の値を受け取る関数で状態を更新（詳細は [createState 詳説](/synstate/ja/guides/core-state-management/) を参照）                               |
| `resetState`   | `() => S`                         | 状態を初期値にリセット                                                                                                                         |
| `getSnapshot`  | `() => S`                         | 購読せずに現在の値を同期的に読み取る                                                                                                           |
| `initialState` | `S`                               | `createState` に渡された初期値                                                                                                                 |

## 派生 Observable の購読: `useObservableValue`

3番目の要素の `state` は通常の Observable であり、`pipe`、`map`、`combine` などで自由に変換できます。派生した Observable を React コンポーネントで購読するには `useObservableValue` を使用します：

```tsx
import type * as React from 'react';
import { map } from 'synstate';
import { createState, useObservableValue } from 'synstate-react-hooks';

const [useCount, , { state: count$ }] = createState(0);

// Derive a new Observable using pipe + map
const doubled$ = count$.pipe(map((n) => n * 2));

const message$ = count$.pipe(
    map((n) => (n === 0 ? 'Click to start' : `Count is ${n}`)),
);

const CountDisplay = (): React.JSX.Element => {
    const count = useCount(); // Equivalent to using useObservableValue(count$)

    // Subscribe to derived Observables with useObservableValue
    const doubled = useObservableValue(doubled$);

    const message = useObservableValue(message$);

    return (
        <div>
            <p>{`Count: ${count}, Doubled: ${doubled}`}</p>
            <p>{message}</p>
        </div>
    );
};
```

`useObservableValue` は `createState`、`pipe`、`combine` など、SynState のあらゆるオペレーターから得られる `Observable` に対して動作します。Observable を購読し、現在の値を React state として返します。値が変化するとコンポーネントが再レンダリングされます。

### 初期値を持たない Observable のためのフォールバック

`useObservableValue` はオーバーロードされており、ソースに初期値があるかどうかに応じて戻り値の型が変わります：

| シグネチャ                                                          | 戻り値の型       |
| ------------------------------------------------------------------- | ---------------- |
| `useObservableValue<A>(obs: InitializedObservable<A>)`              | `A`              |
| `useObservableValue<A>(obs: Observable<A>)`                         | `A \| undefined` |
| `useObservableValue<A, B = A>(obs: Observable<A>, initialValue: B)` | `A \| B`         |

第二引数はソースがまだ値を発行していない場合に使われるフォールバック値です（内部的に `Optional.unwrapOr` で適用されます）：

```tsx
import type * as React from 'react';
import { type Observable } from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';

// Observable<string> that may not have emitted yet.
declare const userName$: Observable<string>;

const Greeting = (): React.JSX.Element => {
    const userName = useObservableValue(userName$, 'Guest'); // string

    return <p>{`Hello, ${userName}`}</p>;
};
```

`createState` から得られる Observable や、初期値を保持する `pipe` チェーンから得られる Observable は `InitializedObservable<T>` であるため、フォールバックは不要です。

## React v17 以前

React 16.8–17（`useSyncExternalStore` なし）を使用している場合は、`synstate-react-hooks-compat` をインストールしてください：

```bash
npm add synstate-react-hooks-compat
```

このパッケージは `synstate-react-hooks` と**同じ API** を提供しますが、内部で `useState` + `useEffect` を使用します。import を変更するだけで使えます：

```tsx
import { createState } from 'synstate-react-hooks-compat';

const [useUserState, setUserState] = createState({
    name: '',
    email: '',
});
```

すべてのフック（`createState`、`createReducer`、`createBooleanState`、`useObservableValue`、`useObservableEffect`）が同じように動作します。React 18+ にアップグレードする際は、import を `synstate-react-hooks` に変更するだけで、他のコード変更は不要です。

:::note
`synstate-react-hooks`（React 18+）は Concurrent Rendering 中のティアリングを防ぐために `useSyncExternalStore` を使用しています。compat パッケージではこの保証はありませんが、通常の（非 Concurrent）レンダリングでは正しく動作します。
:::

### 手動で実装する場合（追加パッケージ不要）

コアの `synstate` パッケージを `useState` と `useEffect` で直接使用することもできます：

```tsx
import * as React from 'react';
import { createState } from 'synstate';

// Global state (outside component)
const [userState, setUserState, { getSnapshot }] = createState({
    name: '',
    email: '',
});

const UserProfile = (): React.JSX.Element => {
    const [user, setUser] = React.useState(getSnapshot());

    React.useEffect(() => {
        const subscription = userState.subscribe(setUser);

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div>
            <p>{`Name: ${user.name}`}</p>
            <button
                onClick={() => {
                    setUserState({
                        name: 'Alice',
                        email: 'alice@example.com',
                    });
                }}
            >
                {'Set User'}
            </button>
        </div>
    );
};
```
