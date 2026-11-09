---
title: 更新の伝わり方
description: 更新は 1 つの番号です。届いた派生値を深さの順に 1 回ずつ計算し直し、すべての値が新しくなった後で effect が実行され、途中の書き込みは自分の順番を待ちます。
---

このページでは、1 回の更新を、それを始める書き込みから最後に呼ぶ購読者まで追いかけます。同じ手順をフィールド単位で追うのが[更新を追跡する](/mono/synstate-next/ja/internals/tracing-an-update/)です。

## 2 つの段階

更新は 2 つの段階で進みます。

1. **再計算**：更新の届いた派生ノードを深さの順に、親がすべて済んだ後に 1 回ずつ計算し直します。
2. **effect** が、キューに入った順に、すべての値が新しくなった後で実行されます。effect は値の後に実行されるもののことで、購読者も synstate-dom-next の束縛も effect です。

```tsx
import { createState, derive, map } from 'synstate-next';

const mut_log: string[] = [];

const [a, setA] = createState(1);

const b = a.pipe(
    map((x) => {
        mut_log.push(`compute b from a = ${x}`);

        return x + 1;
    }),
);

const c = derive([a, b], (x, y) => {
    mut_log.push(`compute c from a = ${x}, b = ${y}`);

    return x + y;
});

a.subscribe((x) => {
    mut_log.push(`effect of a: a = ${x}, c = ${c.value}`);
});

c.subscribe((x) => {
    mut_log.push(`effect of c: c = ${x}`);
});

const start = mut_log.length;

setA(2);

assert.deepStrictEqual(mut_log.slice(start), [
    // Recomputing: each node once, after its parents.
    'compute b from a = 2',
    'compute c from a = 2, b = 3',
    // The effects, every value up to date: a's effect already sees the new c.
    'effect of a: a = 2, c = 5',
    'effect of c: c = 5',
]);
```

`a` の effect が先にキューに入りますが、実行されるのは `c` が計算し直された後なので、新しい `c` を読みます。synstate なら `a` の購読者は `a` が変わった時点で実行され、古い `c` を読んでいました。

<figure>
<svg viewBox="0 0 720 230" role="img" aria-label="1 回の更新の段階。書き込みは更新を待ち、深さ 1・2・3 を計算し直し、effect が実行され、遅らせた書き込みと effect の書き込みが次の更新を始める。" style="width:100%;height:auto;font:13px var(--sl-font, sans-serif)">
  <defs>
    <marker id="arrow-phases-ja" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="10" y="40" width="110" height="60" rx="8"/>
    <rect x="160" y="20" width="300" height="100" rx="8" stroke="var(--sl-color-accent)"/>
    <rect x="500" y="40" width="100" height="60" rx="8" stroke="var(--sl-color-accent)"/>
    <rect x="175" y="60" width="80" height="44" rx="6"/>
    <rect x="270" y="60" width="80" height="44" rx="6"/>
    <rect x="365" y="60" width="80" height="44" rx="6"/>
    <path d="M120,70 H158" marker-end="url(#arrow-phases-ja)"/>
    <path d="M255,82 H268" marker-end="url(#arrow-phases-ja)"/>
    <path d="M350,82 H363" marker-end="url(#arrow-phases-ja)"/>
    <path d="M460,70 H498" marker-end="url(#arrow-phases-ja)"/>
    <path d="M550,100 V170 H65 V102" stroke-dasharray="5 4" marker-end="url(#arrow-phases-ja)"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="65" y="66">setA(2)</text>
    <text x="65" y="84" font-size="11">更新待ち</text>
    <text x="310" y="42" font-weight="bold">再計算</text>
    <text x="215" y="80">深さ 1</text>
    <text x="215" y="96" font-size="11">再計算</text>
    <text x="310" y="80">深さ 2</text>
    <text x="310" y="96" font-size="11">再計算</text>
    <text x="405" y="80">深さ 3</text>
    <text x="405" y="96" font-size="11">再計算</text>
    <text x="550" y="66" font-weight="bold">effects</text>
    <text x="550" y="84" font-size="11">キューの順に</text>
    <text x="310" y="190">再計算中に遅らせた書き込みと、effect の書き込み:</text>
    <text x="310" y="208">次の更新へ（続けられるのは 100 回まで）</text>
  </g>
</svg>
</figure>

## 更新は数値

スケジューラーは 1 つの整数、**更新番号**（コードでは `epoch`）を持ち、更新ごと、そして何も観測していない書き込みごとに 1 つ増やします。各ノードには、それと比べる整数のフィールドが 2 つあります。

- `queuedAt` は、この更新のためにキューに入っているときに更新番号と等しくなります。子をキューに入れるとここに更新番号を書くので、2 つの親から届く子も、先に届いた方によって 1 回だけキューに入り、何もメモリを確保しません。
- `changedAt` は、この更新で値を流したときに更新番号と等しくなります。親が複数あるノードはどの親が流したかを確かめます。親が 1 つのノードは、それ以外にキューに入る理由がないので、親が流したことを知っています。

## 深さのバケット

ノードの深さは、いちばん深い親の深さに 1 を足したものです。キューは深さごとのバケットの配列で、各バケットは使っているスロットの数をカウンターで持ちます。再計算では、ノードを持つ最も浅いバケットから最も深いバケットまで順に辿ります。値を流したノードは子をより深いバケットにしか入れないので、辿っている最中のバケットが伸びることはなく、各ノードは親がすべて済んだ後に辿られます。ダイヤモンドを含めて、グリッチは起きません。

<figure>
<svg viewBox="0 0 720 220" role="img" aria-label="深さで並べたグラフ。A は深さ 0、B と D は深さ 1、BD と E は深さ 2、C は深さ 3、C の購読者は effect。" style="width:100%;height:auto;font:13px var(--sl-font, sans-serif)">
  <defs>
    <marker id="arrow-depth-ja" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
  </defs>
  <g fill="currentColor" text-anchor="middle" font-size="11" opacity="0.7">
    <text x="60" y="20">深さ 0</text>
    <text x="210" y="20">深さ 1</text>
    <text x="360" y="20">深さ 2</text>
    <text x="510" y="20">深さ 3</text>
    <text x="650" y="20">effects</text>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M135,30 V210 M285,30 V210 M435,30 V210 M585,30 V210" stroke-dasharray="3 5" opacity="0.4"/>
    <circle cx="60" cy="115" r="22"/>
    <circle cx="210" cy="65" r="22"/>
    <circle cx="210" cy="165" r="22"/>
    <circle cx="360" cy="65" r="22"/>
    <circle cx="360" cy="165" r="22"/>
    <circle cx="510" cy="65" r="22"/>
    <rect x="615" y="45" width="70" height="40" rx="6" stroke="var(--sl-color-accent)"/>
    <path d="M80,105 L188,72" marker-end="url(#arrow-depth-ja)"/>
    <path d="M80,125 L188,158" marker-end="url(#arrow-depth-ja)"/>
    <path d="M232,65 H336" marker-end="url(#arrow-depth-ja)"/>
    <path d="M228,152 L340,78" marker-end="url(#arrow-depth-ja)"/>
    <path d="M232,165 H336" marker-end="url(#arrow-depth-ja)"/>
    <path d="M382,65 H486" marker-end="url(#arrow-depth-ja)"/>
    <path d="M532,65 H613" stroke-dasharray="5 4" marker-end="url(#arrow-depth-ja)"/>
  </g>
  <g fill="currentColor" text-anchor="middle" dominant-baseline="central">
    <text x="60" y="115">A</text>
    <text x="210" y="65">B</text>
    <text x="210" y="165">D</text>
    <text x="360" y="65">BD</text>
    <text x="360" y="165">E</text>
    <text x="510" y="65">C</text>
    <text x="650" y="65" font-size="11">購読者</text>
  </g>
</svg>
</figure>

更新のコストは届いた範囲で決まります。キューに入ったノードはそれぞれ 1 回辿られ、届かなかったノードには触れません。優先度付きキューでも同じ順序は得られますが、ノードごとに対数のコストがかかります。深さで添字付けしたバケットなら定数です。

## 値が変わらなければそこで止まる

ノードの `recompute` は、値を流すかどうかを返します。値を計算するノード（`map`・`derive`・`keepEqualParts`・状態への書き込み、それに切り替えたときの `switchMap`）は、その値が持っている値と等しければ `false` を返し、子はキューに入りません。その下は辿られません。値を流すだけのオペレーター（`filter`・`take`・`skip` など）は届いたものを流しますが、それは上流の親がすでに変化と判断したものです。イベントを流すオペレーター（`merge`・`zip`・`scan`・`pairwise`・時間系のオペレーター）は比較しません。繰り返されたイベントもイベントだからです。

## effect は値の後に実行される

値を流したノードは、自分の effect を、届いた順に 1 つのリストへ入れ、effect は値を計算し直している間そこで待ちます。最も深いバケットが済むと、effect が実行されます。どの effect も、グラフのすべてのノードが最新になった状態を目にするので、どれを読んでも構いません。例外を投げた effect も、同じ更新の他の effect や次の更新を止めません。それらが書き込んだものは伝わり続けるので、1 つの束縛が失敗しても画面の残りが状態から取り残されることはなく、例外は続いて起きた更新がすべて終わってから投げられます。ただし、投げ続けるものは書き込み続けるかもしれないので、後の更新でも effect が例外を投げると、ノードが例外を投げたときと同じく続く更新はその場で終わります。まだキューにあったものは捨てられ、最初の例外が投げられます。

## 更新中に来る書き込み

**値を計算し直している間に**（たとえば `map` の中から）行った書き込みは、すでに辿ったかもしれないノードを変えてしまいます。そこでこの更新の effect が実行されるまで遅らせ、その後に順に適用します。そのため、この更新の effect は古い値を見て、書き込みは次の更新を始めます。

```tsx
import { createState, map } from 'synstate-next';

const [a, setA] = createState(0);

const [b, setB] = createState(0);

const mut_log: string[] = [];

// A write from inside a derivation, shown only for the order: derive the
// value instead.
const watched = a.pipe(
    map((x) => {
        setB(x * 10);

        mut_log.push(`b = ${b.value} right after setB(${x * 10})`);

        return x;
    }),
);

watched.subscribe(() => {
    mut_log.push(`b = ${b.value} in the effects`);
});

const start = mut_log.length;

setA(1);

// The write waits, and the effects of this update still see the old value.
assert.deepStrictEqual(mut_log.slice(start), [
    'b = 0 right after setB(10)',
    'b = 0 in the effects',
]);

// Applied after the effects, it started the next update.
assert.strictEqual(b.value, 10);
```

**effect が**行った書き込みは、次の更新の始まりです。更新が入れ子になることはありません。次の更新は、この更新の effect がすべて実行された後に、自分の更新番号で実行されます。effect やオペレーターが自分の更新の届く先に書き込み続けるプログラムは、更新が 100 回続いたところで原因を示すエラーで止まります。

更新の外で行った書き込みは、すぐに更新を始めます。`batch` が開いているときは、いちばん外側の batch が戻ったときに始めます。更新の前に 2 回書き込んだ状態もキューに入るのは 1 回だけで、更新はその時点で持っている値を読みます。

## ノードは作られた後のことを見る

値を流すたびに番号が振られ、ノードは作られた時点の番号を記録します。それより前に流れた値は、親が持っている値としてしか届きません。そのため、ソースに書き込んだ batch の中で作った購読者や `take` は、書き込まれた値を二重に数えません。作られたときにその値を読んでおり、それを書いた流出はその前だったからです。

## synstate より速い理由

- **更新ごとに何も確保しません。** 更新は整数で、キューは長さをカウンターで持つ配列です。空にしても裏の領域は捨てないので、次の更新がそのまま使います。
- **親が 1 つのノードは何も確かめません。** キューに入ったこと自体が、親が値を流したことを意味します。
- **変わらない値で止まるのが既定です。** 値を計算するノードはすべてそれを比べるので、更新は変わらない最初のノードで止まります。
- **更新は入れ子になりません。** 購読者からの書き込みは、1 回目の中に自前のバケットを持つ 2 回目の更新を開くのではなく、この更新の effect の後の独立した更新になります。
- **ノードはクラスです。** メソッドはプロトタイプに置かれ、各オペレーターは `recompute` をオーバーライドするサブクラスです。ノードはフィールドだけでできています。

測定結果は、`libs/synstate-next` の `pnpm run benchmark` が書き出す [BENCHMARK.md](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-next/BENCHMARK.md) にあります。
