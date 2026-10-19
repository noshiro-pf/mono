---
title: 'カスタム operator と creator'
description: 組み込みの observable を作っているのと同じ factory で、自分の operator と生成関数を書く方法。
sidebar:
    order: 5
---

SynState の組み込みの observable はすべて 4 つの factory のどれかで作られていて、同じ factory が export されています。これで作ったカスタム operator や creator は、`map` や `source` と同じようにグリッチのない伝搬に加わります。

| Factory                                | 作るもの                                           | これで作られている組み込み        |
| :------------------------------------- | :------------------------------------------------- | :-------------------------------- |
| `createRootObservable`                 | 親を持たない observable（`kind: 'root'`）          | `source`、`timer`、`fromPromise`  |
| `createSyncChildObservable`            | 親と同じ更新の中で値を出す子                       | `map`、`filter`、`combine`、`zip` |
| `createInitializedSyncChildObservable` | 同上。常に値を持つ型になる                         | `scan`、`withInitialValue`        |
| `createAsyncChildObservable`           | 後から、自分で始めた更新の中で値を出すことがある子 | `debounce`、`audit`、`switchMap`  |

名前はすべての observable が持ち、debugger にも表示される `kind`（`'root'`、`'sync child'`、`'async child'`）に揃えています。

## 同期の operator

子の factory は config と `createTryUpdate` コールバックを受け取ります。`createTryUpdate` は新しい observable が自分自身に使える tools を受け取り、`tryUpdate` を返します。SynState は、その observable に届く更新のたびに、更新のトークンを渡して `tryUpdate` を呼びます。

```ts
import { Optional } from 'ts-data-forge';
import { createSyncChildObservable, type Observable } from 'synstate';

export const double = (src: Observable<number>): Observable<number> =>
    createSyncChildObservable(
        { parents: [src], initialValue: Optional.none },
        ({ setNext }) =>
            (updateToken) => {
                const sn = src.getSnapshot();

                if (src.updateToken !== updateToken || Optional.isNone(sn)) {
                    return; // the parent did not emit in this update
                }

                setNext(sn.value * 2, updateToken);
            },
    );
```

`src.updateToken` は、`src` が最後に値を出した更新のトークンです。`tryUpdate` が受け取ったトークンと違えば、`src` はこの更新ではスキップされた（たとえば上流の `filter` が値を通さなかった）ということで、`double` もスキップします。値を出すには受け取ったトークンで `setNext` を呼びます。呼ばないことがスキップで、その子も同じ比較でそれを知ります。

親が複数あるときは、親ごとにトークンを比べます。`combine` はどれかの親が値を出せば値を出し、`zip` は値を出した親の値をキューに積みます。

### depth と、親でない observable を読む場合

更新は `depth` の昇順に observable へ届きます。これが SynState のグリッチ対策で、子が親を読む時点では親はもう値を出しています。子の `depth` は、省略すると一番深い親の `depth` に 1 を足した値になります。`withCurrentValueFrom` は、2 つ目の observable から派生せずに `getSnapshot` で読みます。こうした observable よりも深くないと、更新前の値を読んでしまいます。その場合は `depth` を自分で渡してください。

```ts
createSyncChildObservable(
    {
        parents: [src],
        depth: 1 + Math.max(src.depth, other.depth),
        initialValue: Optional.none,
    },
    ({ setNext }) =>
        (updateToken) => {
            // …
        },
);
```

### Config

| フィールド      | 意味                                                                                                |
| :-------------- | :-------------------------------------------------------------------------------------------------- |
| `parents`       | この observable の派生元                                                                            |
| `initialValue`  | `Optional.some(v)` か `Optional.none`                                                               |
| `depth`         | 省略時は一番深い親の `depth` + 1。親ではないが読む observable の `depth` よりも大きくする           |
| `onComplete`    | 完了したときに走る後始末（タイマーの解除、購読の解除）                                              |
| `canEmitNoMore` | 親が完了したときに呼ばれる。`true` を返すと、生きている親が残っていてもこの observable を完了させる |
| `flush`         | 非同期の子のみ。完了する前に保留中の値を `startUpdate` で流す。`dispose` では呼ばれない             |

### Tools

| Tool                         | 意味                                                    |
| :--------------------------- | :------------------------------------------------------ |
| `setNext(value, token)`      | `token` の更新の中で `value` を出す                     |
| `getSnapshot()`              | この observable の現在の値                              |
| `complete()`                 | この observable をすぐに完了させる                      |
| `completeAfterPropagation()` | 今の更新がすべての子孫に届いてから完了させる（`take`）  |
| `startUpdate(value)`         | 非同期の子のみ。自分で新しい更新を始めて `value` を出す |

## 非同期の operator

非同期の子は `startUpdate` で後から値を出します。`startUpdate` は自分で更新を始め、その observable から派生したすべてに伝搬させます。

```ts
import { Optional } from 'ts-data-forge';
import { createAsyncChildObservable, type Observable } from 'synstate';

export const delay = (
    src: Observable<number>,
    ms: number,
): Observable<number> => {
    const mut_timers = new Set<ReturnType<typeof setTimeout>>();

    return createAsyncChildObservable(
        {
            parents: [src],
            initialValue: Optional.none,
            onComplete: () => {
                for (const t of mut_timers) {
                    clearTimeout(t);
                }

                mut_timers.clear();
            },
        },
        ({ startUpdate }) =>
            (updateToken) => {
                const sn = src.getSnapshot();

                if (src.updateToken !== updateToken || Optional.isNone(sn)) {
                    return;
                }

                const t = setTimeout(() => {
                    mut_timers.delete(t);

                    startUpdate(sn.value);
                }, ms);

                mut_timers.add(t);
            },
    );
};
```

## Creator

root observable は親を持ちません。`createRootObservable` は config と `init` コールバックを受け取ります。`init` は `startUpdate`、`getSnapshot`、`isCompleted`、`complete` を受け取り、observable に足すメンバーを返します（`source` なら `next`、`timer` なら `start`。なければ `{}`）。

```ts
import { Optional } from 'ts-data-forge';
import { createRootObservable, type RootObservable } from 'synstate';

export const fromEvent = (
    target: EventTarget,
    type: string,
): RootObservable<Event> => {
    const mut_listener: { current?: (e: Event) => void } = {};

    return createRootObservable<Event>(
        {
            initialValue: Optional.none,
            onComplete: () => {
                if (mut_listener.current !== undefined) {
                    target.removeEventListener(type, mut_listener.current);
                }
            },
        },
        ({ startUpdate }) => {
            mut_listener.current = startUpdate;

            target.addEventListener(type, startUpdate);

            return {};
        },
    );
};
```

`onComplete` は `init` が走る前に渡すので、`init` で作るリスナーは `onComplete` から届く場所に置いておきます。

## できないこと

observable の型には、利用者に必要なメンバーだけがあります。`id`、`kind`、`parents`（子のみ）、`getSnapshot`、`isCompleted`、`updateToken`、`depth`、`subscribe`、`pipe`、`complete`、`dispose` です。伝搬が読むメンバー（`tryUpdate`、`addChild` など）は実行時には存在しますが型にはなく、型をオブジェクトリテラルで満たすこともできません。伝搬はこれらのメンバーがあることを前提にしているので、observable は必ず上の factory のどれかで作ります。
