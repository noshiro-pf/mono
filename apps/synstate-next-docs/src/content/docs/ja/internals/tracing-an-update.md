---
title: 更新を追跡する
description: synstate-next のスケジューラーが読み書きするフィールドを、filter のダイヤモンドに対する 2 回の更新と、effect からの書き込みで 1 ステップずつ追います。
---

[更新の伝わり方](/mono/synstate-next/ja/internals/how-an-update-propagates/)では段階を説明しました。このページでは、スケジューラー（`src/core/scheduler.mts`）を、1 つのグラフの 2 回の更新を通してフィールドごとに追います。

## グラフ

```tsx
import { combine, createState, filter, map } from 'synstate-next';

const [A, setA] = createState(0);

const B = A.pipe(map((n) => n * 10)); // depth 1

const D = A.pipe(filter((n) => n % 2 === 0)); // depth 1

const BD = combine([B, D]); // depth 2

const C = BD.pipe(map(([b, d]) => b + d)); // depth 3

const E = D.pipe(map((n) => n * 10)); // depth 2

const mut_seen: number[] = [];

C.subscribe((c) => {
    mut_seen.push(c);
});

setA(1); // B = 10, BD = [10, 0], C = 10; D rejects 1, so E is not reached

setA(2); // B = 20, D = 2, BD = [20, 2], E = 20, C = 22

assert.deepStrictEqual(mut_seen, [0, 10, 22]);

assert.strictEqual(E.peek(), 20);
```

深さはコメントのとおりです。`A` は深さ 0 の状態で、`B` と `D` はそれを追い、`BD` は両方を追い、`C` は `BD` を、`E` は `D` を追います。`C` の購読者は effect です。

## 状態の置き場所

| 場所           | フィールド                       | 内容                                                                                     |
| :------------- | :------------------------------- | :--------------------------------------------------------------------------------------- |
| スケジューラー | `epoch`                          | 今のラウンドの番号。ラウンドごとに 1 増える。                                            |
|                | `phase`                          | `idle`・`drain`・`effects`、または `settle`（effect の後に遅らせた書き込みを適用する）。 |
|                | `pending`                        | ドレインの外で値を流した（書き込まれた）ノード。次のラウンドを待つ。                     |
|                | `buckets[d]`・`bucketLengths[d]` | 深さ `d` のキューに入ったノードと、そのバケットで使っているスロットの数。                |
|                | `minDepth`・`maxDepth`           | ノードを持つバケットの範囲。ドレインはこの範囲を回り、その間に `maxDepth` は伸びる。     |
|                | `effects`                        | このラウンドでキューに入った effect。届いた順。                                          |
|                | `deferred`                       | ドレイン中の書き込み。effect の後に順に適用する。                                        |
|                | `writeCount`                     | これまでに値が流れた回数。                                                               |
| 各ノード       | `depth`                          | いちばん深い親の深さに 1 を足したもの。                                                  |
|                | `queuedAt`                       | 最後にキューに入ったときのエポック。保留中は負の数。                                     |
|                | `changedAt`                      | 最後に値を流したときのエポック。                                                         |
|                | `bornAt`・`emittedAt`            | 作られたときと、最後に値を流したときの `writeCount`。                                    |

## 更新 1: `setA(1)`、奇数

1. `A.set(1)` が `A` の値を変えます。`A` には子があるので、番号が振られ（`writeCount` が 1、`A.emittedAt = 1`）、`queuedAt` に保留の印を付けて `pending` に入ります。phase は `idle` で batch も開いていないので、flush が始まります。
2. ラウンドが始まり、`epoch` がたとえば 2 になります。`A.changedAt = 2` となり、`A` の子がキューに入ります。`B.queuedAt = 2` で `buckets[1]` へ、`D.queuedAt = 2` で `buckets[1]` へ。`minDepth = maxDepth = 1` です。
3. **ドレイン、深さ 1。** `B` が `10` を計算し、`0` と違うので `B.changedAt = 2` となり、`BD` を `buckets[2]` に入れます（`maxDepth = 2`）。`D` が計算し直すと `1` は奇数なので `false` を返します。`D` は `0` を保ち、子はキューに入らず、`E` には触れません。
4. **ドレイン、深さ 2。** `BD` が計算し直します。両方の親の値 `[10, 0]` を読みます。`combine` は比較しないので値を流し、`C` を `buckets[3]` に入れます。
5. **ドレイン、深さ 3。** `C` が `10` を計算して流し、自分の effect をキューに入れます。購読者が `queuedAt = 2` で `effects` に入ります。
6. **effect。** 購読者が実行され、`10` を読みます。`bucketLengths` はすべて 0 に戻っており、ドレインがノードを取り出した各スロットは `undefined` に戻してあるので、ノードを生かし続けるバケットはありません。

## 更新 2: `setA(2)`、偶数

1. 同じ手順でラウンド 3 が始まります。`B` と `D` が `buckets[1]` に入り、更新 1 が空けたスロットに上書きします。配列は確保しません。
2. `B` が `20` を計算して `BD` をキューに入れます（`BD.queuedAt = 3`）。`D` は `2` を計算して流し、やはり `BD` を入れようとしますが、`BD.queuedAt` はすでに 3 なので二重には入りません。`E` が `buckets[2]` に入ります。
3. 深さ 2: `BD` が `[20, 2]` を出して `C` をキューに入れ、`E` は `20` を出します。`E` に子はありません。
4. 深さ 3: `C` が `22` を出します。effect が実行され、`22` を読みます。

親を 2 つ持つノードを二重に辿らないようにしているのは、`queuedAt` とエポックのこの 1 回の比較で、そのコストは整数の比較 1 回です。

## effect からの書き込み

`C` の購読者が別の状態 `R` に書き込むとします。書き込みは `effects` の段階で起きます。`R` は番号を振られて `pending` に入りますが、flush はすでに動いているので、ラウンドの他の effect が実行されるまでは何も起きません。その後ループが `pending` が空でないことを見て、ラウンド 4 を始めます。新しいエポック、`R` の子のキュー、ドレイン、effect です。ラウンドの数は 1 増えます。毎ラウンド書き込む effect を持つプログラムは 100 で止められます。

代わりに**ドレイン**の中（`map` の内側）で書き込むと、それは `deferred` に入ります。ドレインは中断されず、書き込みは effect が実行された後に、他の遅らせた書き込みと順に適用されます。適用すると `R` が `pending` に入り、次のラウンドがそれを伝えます。
