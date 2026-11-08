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

| 場所           | フィールド                       | 内容                                                                                               |
| :------------- | :------------------------------- | :------------------------------------------------------------------------------------------------- |
| スケジューラー | `epoch`                          | 今の更新の番号。更新ごと、そして何も観測していない書き込みごとに 1 増える。                        |
|                | `phase`                          | `idle`・`drain`（再計算）・`effects`、または `settle`（effect の後に遅らせた書き込みを適用する）。 |
|                | `pending`                        | 再計算の外で値を流した（書き込まれた）ノード。次の更新を待つ。                                     |
|                | `buckets[d]`・`bucketLengths[d]` | 深さ `d` のキューに入ったノードと、そのバケットで使っているスロットの数。                          |
|                | `minDepth`・`maxDepth`           | ノードを持つバケットの範囲。再計算はこの範囲を回り、その間に `maxDepth` は伸びる。                 |
|                | `effects`                        | この更新でキューに入った effect。届いた順。                                                        |
|                | `deferred`                       | 再計算中の書き込み。effect の後に順に適用する。                                                    |
|                | `writeCount`                     | これまでに値が流れた回数。                                                                         |
| 各ノード       | `depth`                          | いちばん深い親の深さに 1 を足したもの。                                                            |
|                | `queuedAt`                       | 最後にキューに入ったときの更新番号。`pending` にある間は負の数。                                   |
|                | `changedAt`                      | 最後に値を流したときの更新番号。                                                                   |
|                | `bornAt`・`emittedAt`            | 作られたときと、最後に値を流したときの `writeCount`。                                              |

## 更新 1: `setA(1)`、奇数

1. `A.set(1)` が `A` の値を変えます。`A` には子があるので、番号が振られ（`writeCount` が 1、`A.emittedAt = 1`）、`queuedAt` に `pending` の印を付けて `pending` に入ります。phase は `idle` で batch も開いていないので、更新が始まります。
2. 更新が始まり、`epoch` が 2 になります（`epoch` は 1 から始まり、何も観測していない書き込みでも増えるので、見出しの番号とは一致しません）。`A.changedAt = 2` となり、`A` の子がキューに入ります。`B.queuedAt = 2` で `buckets[1]` へ、`D.queuedAt = 2` で `buckets[1]` へ。`minDepth = maxDepth = 1` です。
3. **再計算、深さ 1。** `B` が `10` を計算し、`0` と違うので `B.changedAt = 2` となり、`BD` を `buckets[2]` に入れます（`maxDepth = 2`）。`D` が計算し直すと `1` は奇数なので `false` を返します。`D` は `0` を保ち、子はキューに入らず、`E` には触れません。
4. **再計算、深さ 2。** `BD` が計算し直します。両方の親の値 `[10, 0]` を読みます。`combine` は比較しないので値を流し、`C` を `buckets[3]` に入れます。
5. **再計算、深さ 3。** `C` が `10` を計算して流し、自分の effect をキューに入れます。購読者が `queuedAt = 2` で `effects` に入ります。
6. **effect。** 購読者が実行され、`10` を読みます。`bucketLengths` はすべて 0 に戻っており、再計算でノードを取り出した各スロットは `undefined` に戻してあるので、ノードを生かし続けるバケットはありません。

## 更新 2: `setA(2)`、偶数

1. 同じ手順で、`epoch` が 3 の次の更新が始まります。`B` と `D` が `buckets[1]` に入り、更新 1 が空けたスロットに上書きします。配列は確保しません。
2. `B` が `20` を計算して `BD` をキューに入れます（`BD.queuedAt = 3`）。`D` は `2` を計算して流し、やはり `BD` を入れようとしますが、`BD.queuedAt` はすでに 3 なので二重には入りません。`E` が `buckets[2]` に入ります。
3. 深さ 2: `BD` が `[20, 2]` を出して `C` をキューに入れ、`E` は `20` を出します。`E` に子はありません。
4. 深さ 3: `C` が `22` を出します。effect が実行され、`22` を読みます。

親を 2 つ持つノードを二重に辿らないようにしているのは、`queuedAt` と更新番号のこの 1 回の比較で、そのコストは整数の比較 1 回です。

## effect からの書き込み

`C` の購読者が別の状態 `R` に書き込むとします。書き込みは `effects` の段階で起きます。`R` は番号を振られて `pending` に入りますが、更新がすでに動いているので、その他の effect が実行されるまでは何も起きません。その後ループが `pending` が空でないことを見て、`epoch` が 4 の次の更新を始めます。`R` の子のキュー、再計算、effect です。続いた更新の数は 1 増えます。毎回の更新で書き込む effect を持つプログラムは 100 で止められます。

代わりに**再計算**の中（`map` の内側）で書き込むと、それは `deferred` に入ります。再計算は中断されず、書き込みは effect が実行された後に、他の遅らせた書き込みと順に適用されます。適用すると `R` が `pending` に入り、次の更新がそれを伝えます。この更新も 100 回の数に入ります。
