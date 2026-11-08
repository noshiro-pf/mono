---
title: Signals の上のオペレーター
description: synstate-next のオペレーターを Preact Signals のような signal ライブラリの上に作らない理由 — effect で書いたオペレーターが失うものと、synstate-next だけで UI まで作る synstate-dom-next。
---

Preact Signals もグリッチフリーです。そこで当然の疑問が出ます。Preact Signals を使い、その上に synstate-next のオペレーターを足せばよいのではないか、と。純粋な変換はそのまま載ります。それが `computed` だからです。一方、状態を持つオペレーター、待つオペレーター、リクエストを始めるオペレーターは `computed` にできず、signal に書き込む `effect` になります。そう書くと、synstate-next のオペレーターが保っている 2 つの性質を失います。どの読み手も整合したグラフを見ること、そして 1 回の発行が 1 つのイベントであることです。

このページの例は `@preact/signals-core` を使っており、ライブラリを動かす例はどれもそれに対して実行するテストです。

## そのまま載るもの

| オペレーターの種類             | 例                                              | Preact Signals での書き方                    | 失うもの                                                                                                     |
| ------------------------------ | ----------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 純粋な同期変換                 | `map`、`derive`、`combine`                      | `computed`                                   | なし                                                                                                         |
| 既にある signal から選ぶ       | 複数の状態の 1 つへの `switchMap`               | `branches[selector.value]` を読む `computed` | なし。依存は読んだものに付いていく                                                                           |
| 値から値へ状態を持ち越す       | `scan`、`pairwise`、`skip`、`take`              | signal に書く effect                         | イベント（同値の書き込みは捨てられ、batch は最後の書き込みだけを届ける）、先に作った読み手の整合性、遅延評価 |
| 時間                           | `debounce`、`throttle`、`audit`、`timer`        | タイマーを置いて signal に書く effect        | 遅延評価                                                                                                     |
| 値ごとのリクエストやストリーム | `switchMap`、`mergeMap`、`fromAbortablePromise` | signal に書き、cleanup で中断する effect     | 内側の値がすぐに出る場合（読み込み中の状態）の、先に作った読み手の整合性                                     |

何かを失う行のうち 2 つを、次の 2 つの節で動かします。

## 非同期の段: 新しいクエリと古いリスト

[非同期処理の比較](/mono/synstate-next/ja/comparison/async-logic/)の検索欄を、非同期の段だけに絞ったものです。クエリ、クエリごとのリクエスト、そしてクエリとリストがどのクエリの結果かを並べて表示する view があります。Preact Signals には `switchMap` がないので、リクエストはあのページと同じく `searchState` に書く effect になり、view はもう 1 つの effect になります。状態、リクエスト、view が表示する文字列は両方の版で共通です。

```tsx
/** What the list under the search box shows. */
export type SearchState = Readonly<{
    status: 'loading' | 'success';
    query: string;
}>;

/** What each version returns: a way to type, and every run of the view. */
export type SearchView = Readonly<{
    setQuery: (query: string) => void;
    viewLog: readonly string[];
}>;

/** How long a request takes to answer. A timer stands in for it below. */
export const answerMs = 100;

export const showView = (query: string, state: SearchState): string =>
    `${query} / ${state.status} for ${state.query}` as const;
```

```tsx
export const createSearchView = (viewCreatedFirst: boolean): SearchView => {
    const query = signal('a');

    const searchState = signal<SearchState>({ status: 'loading', query: 'a' });

    // What the page shows: the query in the box, and what the list is for.
    const view = computed(() => showView(query.value, searchState.value));

    const viewLog: string[] = [];

    const watchView = (): void => {
        effect(() => {
            viewLog.push(view.value);
        });
    };

    // switchMap((q) => request(q)), written as an effect.
    const search = (): void => {
        effect(() => {
            const q = query.value;

            searchState.value = { status: 'loading', query: q };

            const answer = setTimeout(() => {
                searchState.value = { status: 'success', query: q };
            }, answerMs);

            // A newer query cancels the request in flight.
            return () => {
                clearTimeout(answer);
            };
        });
    };

    // Nothing but the order the two effects are created in differs.
    if (viewCreatedFirst) {
        watchView();

        search();
    } else {
        search();

        watchView();
    }

    return {
        setQuery: (q) => {
            query.value = q;
        },
        viewLog,
    };
};
```

答え `a` が届いた後で `setQuery('ab')` を呼ぶと、view を先に作った場合は view が 2 回実行されます。1 回目は `ab / success for a`、つまり新しいクエリと古いクエリのリストの組で、2 回目が `ab / loading for ab` です。検索の effect より後に作ると、`ab / loading for ab` で 1 回だけ実行されます。書き込みは両方の effect に届き、ここでは effect は作った順に実行され、一方が他方に依存する順ではありません。間にある `computed` は読まれたときにはグリッチフリーですが、`searchState` に書く effect はその保証の外にあります。

synstate-next では、リクエストはグラフのノードです。

```tsx
export const createSearchView = (): SearchView => {
    const [query, setQuery] = createState('a');

    // A newer query disposes the previous inner observable, which cancels its
    // request.
    const searchState = query.pipe(
        switchMap((q) =>
            timer(answerMs).pipe(
                map((): SearchState => ({ status: 'success', query: q })),
                // held in the same update as the query
                withInitialValue<SearchState>({ status: 'loading', query: q }),
            ),
        ),
    );

    // What the page shows: the query in the box, and what the list is for.
    const view = combine([query, searchState]).pipe(
        map(([q, state]) => showView(q, state)),
    );

    const mut_viewLog: string[] = [];

    view.subscribe((v) => {
        mut_viewLog.push(v);
    });

    return { setQuery, viewLog: mut_viewLog };
};
```

`switchMap` は内側の Observable の最初の値（読み込み中の状態）を、クエリを変えたのと同じ更新の中で渡します。そのため両方の下にある `view` は `ab / loading for ab` で 1 回実行され、答えが届くと `ab / success for ab` でもう 1 回実行されます。（`switchMap` は `query` が作られたときに持っている `'a'` も射影するので、Preact の effect と同じく `a` もリクエストします。）間違える順番はありません。派生ノードは作った順ではなくグラフの中の深さの順に実行され、購読者はすべての派生ノードの後に、すべての値が新しくなってから実行されるからです。

どのライブラリも同じ立場というわけではありません。Jotai の非同期 atom と Solid の `createResource` はそれぞれのグラフの派生ノードで、同じ view をそれらで書くと（`unwrap`、`resource.loading`）クエリ 1 回につき 1 回実行されます。リクエストを observable に書く `reaction` で表す MobX は、Preact Signals と同じ振る舞いになります。ライブラリごとの一覧は[評価モデル](/mono/synstate-next/ja/comparison/libraries/#評価モデル)の表にあります。

## 状態を持つ段: イベントが値として数えられる

signal が持つのは現在の値です。持っている値と等しい書き込み（`!==`）は何も変えず誰にも通知せず、`batch` が届く effect は最後の書き込みの後に 1 回だけ実行されます。どちらも状態としては正しい振る舞いです。しかしイベントを数えたり組にしたりするオペレーターにはイベントが 1 つ残らず必要で、signal の上では値しか受け取れません。

```tsx
import { batch, effect, signal } from '@preact/signals-core';

// A click on a list item, sent as the item's id.
const clicked = signal<string | undefined>(undefined);

const clickCount = signal(0);

// scan((n) => n + 1, 0), written as an effect.
effect(() => {
    if (clicked.value !== undefined) {
        clickCount.value = clickCount.peek() + 1;
    }
});

clicked.value = 'A';

clicked.value = 'A'; // the same item again: an equal value, dropped

batch(() => {
    // two clicks handled in one batch: the effect sees only the last
    clicked.value = 'B';

    clicked.value = 'C';
});

// 4 clicks, counted as 2
```

synstate-next では、emitter の発行は値に関わらずすべてイベントで、`batch` の中で行った発行もそれぞれ別の更新で届きます（[状態と書き込み](/mono/synstate-next/ja/guides/state-and-writes/)）。

```tsx
import { batch, createValueEmitter, scan } from 'synstate-next';

// A click on a list item, sent as the item's id.
const [clicked, click] = createValueEmitter<string>();

const clickCount = clicked.pipe(scan((n) => n + 1, 0));

let mut_count = 0;

clickCount.subscribe((n) => {
    mut_count = n;
});

click('A');

click('A'); // every emission is an event, equal or not

batch(() => {
    // two clicks in one batch: each is delivered in an update of its own
    click('B');

    click('C');
});

// 4 clicks, counted as 4
```

`createState` は signal と同じく状態を持つものです。持っている値と等しい書き込みは捨て、その状態の更新の前に何度も書き込まれたとき（`batch` の中、派生値の計算中、同じ更新の購読者から）は、後段には更新が始まるときに持っている値が 1 つだけ届きます。イベントは、発行をすべて渡す `createValueEmitter` か `source` で送ります。Preact Signals だけで書くなら、クリックのハンドラーが自分でクリックを数えるでしょう。それで動きますし、それこそが要点です。数える処理は書き込む場所に書くコードであって、どの signal の後にも置けるオペレーターではありません。

## 直すには何が要るか

effect で書いたオペレーターをグリッチフリーにするには、それぞれが、自分の書いたものを読むすべての effect より先に、つまり深さ順に実行される必要があります。Preact Signals はノードの深さも effect の実行順も公開していないので、オペレーターは自前の深さを持ち、書き込みを自前のキューに通すことになります。それは synstate-next の深さ順のキューを Preact Signals の上に作り直すことで、その下では Preact Signals 自身の印付けと version の確認も払い続けます。イベントを数えるには、書き込みのたびに新しいオブジェクトで包み、batch の外で書く必要もあります。それは signal をイベント列として使うことです。

また effect は読んだものすべてを購読し、書いたものを誰かが読むかどうかに関わらず、変化のたびに再実行されます。そのため effect で書いたオペレーターより下のグラフは synstate-next と同じく先行評価になり、Preact Signals が処理を飛ばせるようにしている遅延評価の `computed` と依存の追跡は、`computed` の部分にしか効きません。

## オペレーターではなくモデル

どの読み手も整合したグラフを見ること、1 回の発行が 1 つのイベントであることは、Preact Signals に足りないオペレーターではありません。どちらもその下にあるモデルから来ています。届いたノードを深さ順に実行する更新と、発行を 1 つ残らず渡す emitter（`createValueEmitter`、`source`）です。Preact の signal が持つのは現在の値で、effect の実行順がグラフの中の位置で決まることはありません。effect で書いたオペレーターはそのモデルを引き継ぐので、synstate-next の保証を取り戻すには、前の節のとおり synstate-next のモデルをその中に作り直すことになります。処理を飛ばせる利点も持ち越せません。それが効くのは、もともとそのまま載る部分だけだからです。synstate-next が提供するのは、オペレーターと、それを正しく保つモデルの両方です。非同期の段も状態を持つ段も、すべての派生値と同じグリッチフリーなグラフのノードであり、`scan` のような状態を持つ段は、前にある emitter の発行をすべて受け取ります。

## synstate-next で UI を作る

synstate-next を画面に出す手段は [synstate-dom-next](/mono/synstate-dom-next/ja/) です。Observable を DOM に直接束縛します。コンポーネントは 1 回しか実行されず、更新はグラフから、束縛された属性、プロパティ、テキストノードへ直接届きます。仮想 DOM もコンポーネントの再実行もありません。その束縛は同じスケジューラの上で動くので、購読者と同じく各更新の派生値の後に実行されます。上の検索の段なら、クエリからページに表示するものまでが 1 つのグラフになり、Observable を別のものに変える箇所がどこにもありません。コンポーネントのリクエスト、タイマー、束縛は 1 つの owner がまとめて破棄します。

synstate-next にはまだ Preact Signals との橋渡しがありません。パイプラインの結果を別のライブラリに渡すなら、`subscribe` が新しくなった値を 1 つ残らず渡します。その継ぎ目で上の保証は終わります。継ぎ目を越える値はすべて変換され、signal に入ったイベントは値になります。
