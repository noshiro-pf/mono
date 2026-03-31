---
title: 'createState 詳説'
sidebar:
    order: 3
---

[クイックサンプル](/synstate/ja/getting-started/introduction/#クイックサンプル)で、`createState` が3要素のタプルを返すことを紹介しました。このページでは3番目の要素の詳細と、React の `useState` との設計上の違いについて説明します。

## 3番目の要素

```ts
const [state, setState, { updateState, resetState, getSnapshot }] =
    createState(0);
```

| 関数          | 型                                | 説明                                 |
| :------------ | :-------------------------------- | :----------------------------------- |
| `setState`    | `(v: S) => S`                     | 状態を新しい値に設定する             |
| `updateState` | `(updateFn: (prev: S) => S) => S` | 前の値を受け取る関数で状態を更新する |
| `resetState`  | `() => S`                         | 状態を初期値にリセットする           |
| `getSnapshot` | `() => S`                         | 現在の値を同期的に読み取る           |

## 同期的な状態更新

React の `useState` の setter 関数は非同期的に再レンダリングをスケジュールしますが、SynState の `setState`、`updateState`、`resetState` は**同期的に**実行され、更新後の状態値を戻り値として返します。また、状態更新の直後に `getSnapshot()` を呼び出すことで、最新の値を即座に取得することもできます。

```ts
const [state, setState, { updateState, resetState, getSnapshot }] =
    createState(0);

// setState は更新後の状態値を同期的に返す
const newValue = setState(42);
console.log(newValue); // 42

// updateState も更新後の状態値を返す
const updated = updateState((prev) => prev + 1);
console.log(updated); // 43

// getSnapshot() は最新の状態を即座に反映する
console.log(getSnapshot()); // 43

// resetState は初期値を返す
const reset = resetState();
console.log(reset); // 0
```

## `setState` と `updateState` を分離した設計

React の `useState` では、setter 関数が直接の値と更新関数の両方を受け取れるようにオーバーロードされています：

```ts
// React useState — 単一の setter が両方の形式を扱う
setCount(5); // 直接値を設定
setCount((prev) => prev + 1); // 更新関数を渡す
```

SynState では、これらを意図的に `setState`（値を直接設定）と `updateState`（前の状態に基づいて更新）の2つの関数に分離しています：

```ts
// SynState — 明確に分離された関数
setState(5); // 直接値を設定
updateState((prev) => prev + 1); // 更新関数を渡す
```

これはオーバーロードによるシグネチャの曖昧さを回避し、各呼び出しの意図を明確にするための設計上の選択です。引数が値なのか関数なのかを実行時に判別する必要がありません。

## `createReducer` — Redux スタイルの状態管理

明確に定義されたアクションで状態遷移を行う場合、`createReducer` が Redux ライクなパターンを提供します。`setState` / `updateState` の代わりに、型付きアクションを `dispatch` します：

```ts
type Action = Readonly<{ type: 'increment' } | { type: 'decrement' }>;

const [state, dispatch] = createReducer((s: number, action: Action) => {
    switch (action.type) {
        case 'increment':
            return s + 1;
        case 'decrement':
            return s - 1;
    }
}, 0);

dispatch({ type: 'increment' }); // state は 1 になる
```

`createState` と同様に、`dispatch` は同期的に実行され、新しい状態を返します。返される `state` は `InitializedObservable` であり、subscribe やオペレーターによる派生が可能です。

完全な例は [`createReducer` の API リファレンス](/synstate/ja/reference/create-reducer/)を参照してください。

## `createBooleanState` — トグル状態

真偽値フラグ（モーダル、ドロワーの開閉状態、ダークモードなど）には、`createBooleanState` が便利な名前付きメソッドを提供します。`() => setState(true)` のようなラッパーを書く必要がありません：

```ts
const [isOpen$, { setTrue: open, setFalse: close, toggle }] =
    createBooleanState(false);

open(); // isOpen$ は true を発行
close(); // isOpen$ は false を発行
toggle(); // isOpen$ は true を発行
```

返されるメソッド（`setTrue`、`setFalse`、`toggle`）は安定した参照を持ち、イベントハンドラのコールバックとして直接渡せます。

React 連携を含む完全な例は [`createBooleanState` の API リファレンス](/synstate/ja/reference/create-boolean-state/)を参照してください。
