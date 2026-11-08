---
title: UI と組み合わせる
description: synstate-next のために作った UI ライブラリ synstate-dom-next と、それ以外のフレームワークに synstate-next をつなぐ方法。
---

## synstate-dom-next

[synstate-dom-next](/mono/synstate-dom-next/ja/) は、synstate-next のために作った UI ライブラリです。Observable を JSX にそのまま渡し、コンポーネントは 1 回だけ実行され、束縛した属性・プロパティ・テキストはそれぞれ synstate-next のグラフの effect になります。更新が落ち着いてから、差分を取ることなく 1 回だけ実行されます。マウントは batch で、switch はどの分岐を外すかをドレインの中で決めるので、分岐がそれを除外する値で計算してしまうことはありません。間に挟まるアダプターはなく、このサイトのオペレーターで組んだグラフがそのまま DOM で終わります。

## それ以外のフレームワーク

React と Preact のフック、Preact Signals との橋渡しは、まだ synstate-next 向けに作り直していません。フレームワークが必要とするものは小さく、何かが変わったと知らせてもらう方法と、値を読む方法だけです。React の `useSyncExternalStore` はまさにそれを受け取ります。

```tsx
import {
    createState,
    map,
    type InitializedObservable,
    type Unsubscribe,
} from 'synstate-next';

// What React's `useSyncExternalStore` and similar hooks take.
type ExternalStore<A> = Readonly<{
    subscribe: (onStoreChange: () => void) => Unsubscribe;
    getSnapshot: () => A;
}>;

const toExternalStore = <A,>(
    observable: InitializedObservable<A>,
): ExternalStore<A> => {
    const store: ExternalStore<A> = {
        subscribe: (onStoreChange) =>
            observable.subscribe(() => {
                onStoreChange();
            }),
        getSnapshot: () => observable.value,
    };

    return store;
};

const [count, setCount] = createState(0);

const label = toExternalStore(count.pipe(map((n) => `count: ${n}`)));

// In a React component:
// const text = useSyncExternalStore(label.subscribe, label.getSnapshot);

let mut_changes = 0;

const unsubscribe = label.subscribe(() => {
    mut_changes += 1;
});

setCount(1);

assert.strictEqual(label.getSnapshot(), 'count: 1');

unsubscribe();

// Called once at subscription, once for the change.
assert.strictEqual(mut_changes, 2);
```

気をつけることが 2 つあります。

- **フレームワークが購読を解除できる場所で購読します。** どの owner の外で行った購読は、`Unsubscribe` が呼ばれるまで生き続けます。購読した effect からそれを返してください。
- **ロジックはグラフに置きます。** コンポーネントが表示するものは、コンポーネントの外で `map` や `derive` を使って派生させ、その結果をコンポーネントに渡します。そうすればコンポーネントはその結果が変わったときだけ再レンダリングされ、結果を変えない更新は等値打ち切りがすでに落としています。
