---
title: React と Preact
description: 状態をフックとして渡し、どの Observable でもコンポーネントから読める synstate-react-hooks と synstate-preact-hooks です。
---

synstate は特定の UI ライブラリに依存しません。React と Preact には、次の 3 つのパッケージでつなぎます。

- **`synstate-react-hooks`**: React 18 以降向けです。
- **`synstate-react-hooks-compat`**: React 16.8 と 17 向けです。API は同じで、Observable を `use-sync-external-store/shim` で読みます。
- **`synstate-preact-hooks`**: Preact 向けです。

どれも synstate が export するものを `createState`・`createReducer`・`createBooleanState` 以外すべて re-export し、この 3 つはフックを返す版に置き換えます。フックのパッケージからだけ import すれば、コンポーネントとアプリケーションの他の部分は同じグラフを見ます。

```sh
npm install synstate synstate-react-hooks # React 18 以降
npm install synstate synstate-react-hooks-compat # React 16.8 か 17
npm install synstate synstate-preact-hooks # Preact
```

## 状態をフックとして使う

`createState` は Observable の代わりにフックを返し、その隣にセッターを返します。状態はモジュールのトップレベルで作り、フックを呼ぶすべてのコンポーネントで共有できます。プロバイダーは要りません。

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// Global state (outside component)
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

Observable そのものは 3 番目の要素の `state` プロパティにあり、`updateState`・`resetState`・`getSnapshot` と並んでいます。コンポーネントの外で、そこから値を派生させたり書き込んだりするコードのためのものです。

```tsx
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// Global state (outside component)
const [
    useUserState,
    setUserState,
    {
        resetState: resetUserState,
        updateState: updateUserState,
        state: userState,
    },
] = createState({
    name: '',
    email: '',
});

userState.subscribe((u) => {
    console.log('User is updated:', u);
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
            <button
                onClick={() => {
                    updateUserState((prev) => ({
                        name: prev.name,
                        email: '',
                    }));
                }}
            >
                {'Reset email'}
            </button>
            <button onClick={resetUserState}>{'Reset'}</button>
        </div>
    );
};
```

## どの Observable でも読む

`useObservableValue` は、派生したものも含めてどの Observable でも読みます。`useSyncExternalStore` の上に作ってあります。Observable の値が変わるとコンポーネントを描き直し、Observable が値を持たない間は `undefined` か、渡したフォールバックを返します。

```tsx
import type * as React from 'react';
import { map, type Observable } from 'synstate';
import { createState, useObservableValue } from 'synstate-react-hooks';

const [useCount, setCount, { state: count$ }] = createState(0);

// Derived InitializedObservable — no fallback needed.
const doubled$ = count$.pipe(map((n) => n * 2));

// Imagine an Observable<string> that has no initial value (e.g. one waiting on
// an async source).
declare const userName$: Observable<string>;

const Profile = (): React.JSX.Element => {
    const doubled = useObservableValue(doubled$); // number

    const userName = useObservableValue(userName$, 'Guest'); // string

    return (
        <div>
            <p>{`Doubled count: ${doubled}`}</p>
            <p>{`Hello, ${userName}`}</p>
        </div>
    );
};
```

synstate の Observable の現在の値は同期的に読めるので、サーバーレンダリングでも動きます。モジュールのトップレベルで作ったストアはサーバーのプロセスに 1 つで、そのプロセスが描くすべてのリクエストで共有されます。リクエストごとのデータはそこに入れず、リクエストごとにストアを作ってコンテキストで渡してください。

フックはあと 2 つあります。`useObservableEffect(observable, fn)` は、コンポーネントがマウントされている間、値ごとに `fn` を呼び、描き直しはしません。`useValueAsObservable(value)` は props をオペレーターが追える Observable にし、コンポーネントがアンマウントされると破棄します。

## Preact

`synstate-preact-hooks` は Preact の上で同じ API を持ちます。

```tsx
import type * as Preact from 'preact';
import { createState } from 'synstate-preact-hooks';

// Global state (outside component)
const [useUserState, setUserState] = createState({
    name: '',
    email: '',
});

const UserProfile = (): Preact.JSX.Element => {
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

コンポーネントを描き直さずに、値を表示している DOM ノードだけを更新したいときは、代わりに synstate を Preact Signals につなぎます。[Preact Signals](/mono/synstate/ja/integrations/preact-signals/) を見てください。
