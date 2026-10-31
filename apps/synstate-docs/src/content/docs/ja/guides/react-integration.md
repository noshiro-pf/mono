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

`synstate-react-hooks` の `createState` も、コアパッケージと同様に3要素のタプルを返します。3番目の要素には [createState 詳説](/mono/synstate/ja/guides/core-state-management/) で説明されているものと同じユーティリティ（`updateState`、`resetState`、`getSnapshot`、`initialState`）に加え、コアライブラリの Observable である `state` が含まれています：

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

// `state` is the same InitializedObservable<number> that the core synstate
// package's createState returns as its first element.
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
| `updateState`  | `(updateFn: (prev: S) => S) => S` | 前の値を受け取る関数で状態を更新（詳細は [createState 詳説](/mono/synstate/ja/guides/core-state-management/) を参照）                          |
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
import type { Observable } from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';

// Observable<string> that may not have emitted yet.
declare const userName$: Observable<string>;

const Greeting = (): React.JSX.Element => {
    const userName = useObservableValue(userName$, 'Guest'); // string

    return <p>{`Hello, ${userName}`}</p>;
};
```

`createState` から得られる Observable や、初期値を保持する `pipe` チェーンから得られる Observable は `InitializedObservable<T>` であるため、フォールバックは不要です。

## マウント中の副作用：`useObservableEffect`

`useObservableEffect(observable$, fn)` は、コンポーネントのマウント時に `fn` を購読し、アンマウント時に購読を解除します。クエリが変わったら先頭までスクロールするといった、コンポーネントがマウントされている間だけ実行したい、描画内容を変えない副作用に使います。`fn` は現在値があればそれですぐに呼ばれ、その後は値が発行されるたびに呼ばれます。戻り値はなく、コンポーネントを再レンダリングしません：

```tsx
import type * as React from 'react';
import { createState, useObservableEffect } from 'synstate-react-hooks';

// Written by the search box
export const [, setQuery, { state: query$ }] = createState('');

// Written by the code that fetches the results
export const [useResults, setResults] = createState<readonly string[]>([]);

const ResultList = (): React.JSX.Element => {
    const results = useResults();

    // Called on mount with the current query, then on every change, until
    // unmount: the page starts at the top and goes back there for a new query
    useObservableEffect(query$, () => {
        window.scrollTo({ top: 0 });
    });

    return (
        <ul>
            {results.map((r) => (
                <li key={r}>{r}</li>
            ))}
        </ul>
    );
};
```

各値は最新のレンダリングの `fn` に渡されるので、`fn` には現在の props と state が見えます。レンダリングのたびに `fn` が新しくなっても購読し直しません。別の Observable を渡すと、購読はそちらに移ります。そのため、レンダリングをまたいで同じものであり続ける Observable（コンポーネントの外で作ったもの、または `React.useMemo` でメモ化したもの）を渡してください。レンダリング中に作った Observable はレンダリングのたびに購読し直され、そのたびに `fn` が現在の値で呼ばれます。`fn` の戻り値は無視されます。アンマウント時の後始末は、別の `React.useEffect` に書いてください。`fn` は subscriber なので、state に書き込んではいけません。それは[伝搬中の書き込み](/mono/synstate/ja/guides/core-state-management/#更新の伝搬中に状態へ書き込まない)で、ここでも ESLint ルールが報告します。`localStorage` への保存のように、コンポーネントに属さない副作用はモジュールスコープでの `subscribe` で書きます。逆に props やコンポーネントの state をグラフに渡すには `useValueAsObservable(value)` を使います（[API リファレンス](/mono/synstate/ja/reference/api/#フック)を参照）。

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
