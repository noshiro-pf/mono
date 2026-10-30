---
title: 'createState 詳説'
description: createState の詳細解説 — SynState のコア API でリアクティブな状態を作成・管理する方法。
sidebar:
    order: 3
---

[クイックサンプル](/mono/synstate/ja/getting-started/introduction/#クイックサンプル)で、`createState` が3要素のタプルを返すことを紹介しました。このページでは3番目の要素の詳細と、React の `useState` との設計上の違いについて説明します。

## 3番目の要素

```ts
const [
    state,
    setState,
    { updateState, resetState, getSnapshot, initialState },
] = createState(0);
```

| 関数           | 型                                | 説明                                 |
| :------------- | :-------------------------------- | :----------------------------------- |
| `setState`     | `(v: S) => S`                     | 状態を新しい値に設定する             |
| `updateState`  | `(updateFn: (prev: S) => S) => S` | 前の値を受け取る関数で状態を更新する |
| `resetState`   | `() => S`                         | 状態を初期値にリセットする           |
| `getSnapshot`  | `() => S`                         | 現在の値を同期的に読み取る           |
| `initialState` | `S`                               | `createState` に渡された初期値       |

## 同期的な状態更新

React の `useState` の setter 関数は非同期的に再レンダリングをスケジュールしますが、SynState の `setState`、`updateState`、`resetState` は**同期的に**実行され、更新後の状態値を戻り値として返します。また、状態更新の直後に `getSnapshot()` を呼び出すことで、最新の値を即座に取得することもできます。

```ts
const [
    state,
    setState,
    { updateState, resetState, getSnapshot, initialState },
] = createState(0);

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

## 更新の伝播中に状態へ書き込まない

更新は同期的なので、購読者や `map` などの射影の中で呼んだ `setState`（`updateState`・`resetState`・`dispatch`・`next` も同じ）は、それを引き起こした更新がまだ伝播している最中に実行されます。書き込みはその場で伝播しますが、ほかの購読者が中間の状態を観測することがあり、伝播中の状態自身に書き戻すと無限に再帰することもあります。SynState は、状態ごとに最初にこの書き込みが起きたときに `console.warn` を出します。

```ts
const [a$, setA] = createState(0);

const [b$, setB] = createState(0);

// ❌ a$ の伝播中に b$ へ書き込む
a$.subscribe((a) => {
    setB(a * 2);
});

setA(1); // console.warn: synstate: an observable was written to ...
```

代わりに、書き込み先の値を書き込み元から派生させてください。派生した Observable はグラフの一部になるので、glitch なく更新され、デバッガーからも見えます。

```ts
const [a$, setA] = createState(0);

// ✅ b$ を a$ から派生させる
const b$ = a$.pipe(map((a) => a * 2));

setA(1);
```

書き込み元と値の間に重い副作用や `await` がある場合は、それも `fromPromise` や `switchMap` などでグラフに組み込みます。イベントハンドラー、タイマー、`queueMicrotask` のコールバックからの書き込みは伝播の外で実行されるので、対象外です。

[`eslint-plugin-synstate`](/mono/synstate/ja/getting-started/installation/#eslint-プラグイン) の `synstate/no-write-during-propagation` ルールは、`subscribe` のコールバックや `pipe` の中のオペレーターからの書き込みを、実行前に、書かれた場所で報告します。対象は `synstate` 自体から import した関数で、hooks パッケージや Preact Signals パッケージが再エクスポートしたものにはまだ対応していません。

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

完全な例は [`createReducer` の API リファレンス](/mono/synstate/ja/reference/create-reducer/)を参照してください。

## `createBooleanState` — トグル状態

真偽値フラグ（モーダル、 drawer の開閉状態、ダークモードなど）には、`createBooleanState` が便利な名前付きメソッドを提供します。`() => setState(true)` のようなラッパーを毎回書く必要がありません：

```ts
const [isOpen$, { setTrue: open, setFalse: close, toggle }] =
    createBooleanState(false);

open(); // isOpen$ は true を発行
close(); // isOpen$ は false を発行
toggle(); // isOpen$ は true を発行
```

返されるメソッド（`setTrue`、`setFalse`、`toggle`）は安定した参照を持ち、イベントハンドラのコールバックとして直接渡せます。

React 連携を含む完全な例は [`createBooleanState` の API リファレンス](/mono/synstate/ja/reference/create-boolean-state/)を参照してください。
