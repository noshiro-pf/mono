---
title: synstate-next を使う理由
description: 作り直した設計がアプリケーションにもたらすもの。線形コストでグリッチのない更新、落ち着いたグラフで動く購読者、等値打ち切り、owner。どこで役に立つか。
---

## 始めるのは簡単、必要なときには強力

カウンターなら `createState` と `subscribe` だけです。同じモデルがそのままアプリケーションの規模まで広がります。画面に出す値は、少数の状態から `map`・`derive`・非同期オペレーターで派生させ、それらがなすグラフが、何をどの順に計算し直すかを決めます。小さなものから大きなものに移るときに、新しく覚えることはありません。

## なぜ Observable なのか

Observable は、時間とともに変わり、追いかけられる値です。これはフロントエンドが扱うものにそのまま合います。入力は状態、クリックはイベント、リクエストは後から届く値、タイマーは刻む値です。これらを 1 つの抽象で扱えるので、デバウンスやキャンセル、「最新の応答だけ」は、手で持つタイマーやフラグではなく、パイプラインの中のオペレーターになります。検索ボックスとデータテーブルでの違いは[宣言的な状態管理](/mono/synstate-next/ja/guides/declarative-state/)で見られます。

## グリッチがなく、コストは線形

グリッチとは、2 つの値から派生した値が、片方の変化だけを見てもう片方を見ていない瞬間のことです。下のダイヤモンドで、変化を子へすぐに押し出すライブラリは、新しい `tens` と古い `hundreds` から `sum` を計算して一瞬 120 を見せ、それから 220 にします。

synstate-next は、更新が届いたノードを深さごとのバケットに入れ、浅いものから辿ります。そのため `sum` は、親が 2 つとも済んだ後に 1 回だけ計算されます。

```tsx
import { createState, derive, map } from 'synstate-next';

const [a, setA] = createState(1);

const tens = a.pipe(map((x) => x * 10));

const hundreds = a.pipe(map((x) => x * 100));

let mut_computed = 0;

const sum = derive([tens, hundreds], (t, h) => {
    mut_computed += 1;

    return t + h;
});

const mut_seen: number[] = [];

sum.subscribe((value) => {
    mut_seen.push(value);
});

setA(2);

// Never 120 or 210: `sum` is computed once per update, after both of its
// parents, and its subscriber runs once the update has settled.
assert.deepStrictEqual(mut_seen, [110, 220]);

assert.strictEqual(mut_computed, 2);
```

各ノードは 1 回の更新で多くても 1 回しか辿られないので、更新のコストは届いた範囲の大きさだけで決まります。キューの仕組みは[更新の伝わり方](/mono/synstate-next/ja/internals/how-an-update-propagates/)にあります。

## 購読者は更新の後に実行される

synstate では、購読者は Observable が変わった時点で、更新の途中に呼ばれていました。synstate-next は購読者をキューに入れ、更新が届くノードをすべて計算し直してから実行します。購読者がグラフの他の値を読めば、それは必ず最新です。購読者が行った書き込みは、この更新の中に入れ子になった更新ではなく、次の更新になります（同じラウンドでその後に動く購読者は、書き込まれた状態の新しい値と、そこから派生したまだ古い値を読みます）。UI 層の synstate-dom-next はこれを前提にしています。束縛はこの effect なので、分岐のマウントやアンマウントが伝播の途中で起きることはありません。

## 変わらない値で打ち切る

値を計算するノード（`map`・`derive`・状態への書き込み）は、計算した値をすでに持っている値と比べ（`Object.is`、または渡した `equals`）、等しければ何も伝えません。同じ行にマッチするフィルター、変わらないページ数、`false` のままの真偽値。その下のグラフはまったく辿られません。打ち切りを外すべき場面は[値を派生させる](/mono/synstate-next/ja/guides/deriving-values/)で説明しています。

## 完了の代わりに owner

Observable は破棄されることで終わり、破棄は所有関係に従います。owner の実行中に作ったものはすべてその owner に属します。自分の派生値・購読・リクエストを owner の中で作るダイアログは、`dispose()` 1 回でそれらをすべて閉じます。終わりを知らせる何かがグラフを下っていくことはないので、それを伝え忘れるオペレーターもありません。API は [owner と寿命](/mono/synstate-next/ja/guides/owners-and-lifetime/)に、理由は[完了がない理由](/mono/synstate-next/ja/internals/why-no-completion/)にあります。

## 向いている用途

- 画面やコンポーネントをまたいで共有され、同じ派生値をあちこちで読む状態を持つアプリケーション。
- キャンセル・デバウンス・順序付けが必要な非同期の流れ。検索ボックス、自動保存、ポーリング、アップロードなど。
- [synstate-dom-next](/mono/synstate-dom-next/ja/) で作る UI。グラフがそのまま DOM で終わります。

## 次に読むもの

- [状態と書き込み](/mono/synstate-next/ja/guides/state-and-writes/): `createState` と書き込みの規則。
- [値を派生させる](/mono/synstate-next/ja/guides/deriving-values/): `pipe`・`derive`・`combine`・`merge`・`zip`。
