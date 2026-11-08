---
title: 完了がない理由
description: synstate で完了が担っていた仕事と、synstate-next でそれぞれを何が代わりに担うか。owner、自分で親から離れるノード、使う場所で尋ねる settled。それで何が省けるか。
---

synstate には、RxJS と同じく、値とは別にもう 1 つの信号がありました。**完了**です。Observable が「もう値を流さない」と告げるもので、そこから派生したものすべてへグラフを下って送られました。synstate-next にはこれがありません。このページでは、完了が何のためにあったのか、今はそれぞれの仕事を何が担っているのかを説明します。

## 完了がしていたこと

synstate の完了には 4 つの仕事がありました。

1. **入力が終わったことをオペレーターに知らせる。** `mergeMap` と `switchMap` は、内側の Observable がもう値を流せなくなったら手放すために、それを知る必要がありました。`zip` は親が尽きたら止まるために。親が完了すると、どの親も生きていない子は完了しました。
2. **グラフを解放する。** 完了した Observable は親から離れ、もう誰も依存していないものは回収できました。済んだ `take(1)` や発火した `timer` が持っていたものを手放すのは、完了によってでした。
3. **終わりを待つものを終わらせる。** `collectToArray` はソースが完了したときにすべての値で Promise を resolve し、購読者は `onComplete` を渡せました。
4. **保留中の値を出させる。** ソースが完了したとき値を持っていた `debounce` や `audit` は、それを流しました（`flush`）。ストリームの終わりで何も失わないためです。

どの仕事も、すべてのオペレーターに、値との順序を正しく保って、更新の途中でも後でも（`completeAfterPropagation`）完了を伝える責任を負わせていました。伝え忘れたオペレーターがあれば、その下のグラフは永遠に生き続けました。

## それぞれの仕事を今は何が担うか

| 仕事                     | synstate                       | synstate-next                                                                           |
| :----------------------- | :----------------------------- | :-------------------------------------------------------------------------------------- |
| 入力が終わった           | 完了を下へ押し出す             | `settled` を、答えを使う場所で**尋ねる**                                                |
| グラフの解放             | 完了したノードが離れる         | owner が破棄する。済んだノードは自分で親から離れる                                      |
| 終わりを待つ             | `collectToArray`・`onComplete` | 最後の値と一緒に `settled` を読むか、終わりを値として送る。owner の終わりは `onCleanup` |
| 終わりに残った保留中の値 | 完了時の `flush`               | 完了とともになくなった。synstate の `dispose` と同じく、破棄すれば捨てる                |

### owner が寿命

メモリは破棄によって解放され、破棄は所有関係に従います。owner の実行中に作ったものはすべてその owner に属します（[owner と寿命](/mono/synstate-next/ja/guides/owners-and-lifetime/)）。ダイアログの派生値・タイマー・リクエストは、済んでいてもいなくても、ダイアログの owner を破棄すれば消えます。そのためにグラフを下って何かが伝わる必要も、何かを数える必要もありません。

### 済んだノードは親から離れる

もう何も流さない `take`・`takeWhile`・`takeUntil` は、値を保ったまま、自分を親の子から外します。親はそれを辿らず、生かしておくこともありません。そのノード自身の購読者には、単にもう何も届きません。

```tsx
import { createRootOwner, createState, take, timer } from 'synstate-next';

const [a, setA] = createState(0);

// The value held at the start counts: 0, 1, 2.
const firstThree = a.pipe(take(3));

const mut_seen: number[] = [];

firstThree.subscribe((x) => {
    mut_seen.push(x);
});

setA(1);

setA(2);

// Done: it has left `a`, keeps its value, and passes nothing more.
setA(3);

assert.deepStrictEqual(mut_seen, [0, 1, 2]);

assert.strictEqual(firstThree.value, 2);

// A source that is done keeps its value and its subscribers until its
// owner disposes it.
const owner = createRootOwner();

const fired = owner.run(() => timer(100));

await vi.advanceTimersByTimeAsync(100);

assert.strictEqual(fired.getSnapshot(), 0);

owner.dispose();
```

### `settled` は告げるものではなく、尋ねるもの

内側の Observable を追いかけるオペレーター（`mergeMap`、済んだリクエストを 1 つ持っているかもしれない `switchMap`）は、それがもう値を流せないことを知る必要が今もあります。各ノードは尋ねられたら `settled` を答えます。ソースなら、破棄されたか、タイマー・Promise・購読が終わったとき。派生ノードなら、破棄されたか、親がすべて settled で、自分自身が待っているもの（`debounce` のタイマー、内側の Observable）がないとき。`mergeMap` は内側の Observable を射影したときと、それが値を流したときに尋ね、settled で、その更新の effect が流した値を読み終えていれば手放します。`createDerived` で書いたオペレーターは、計算し直させた更新より後に値を流すなら、自分の `settled` を用意します（[独自のオペレーターとソース](/mono/synstate-next/ja/guides/custom-operators-and-sources/#非同期のオペレーター)）。

答えを使う場所で尋ねるのは、他の場所に何のコストもかけません。関心のない信号を転送するオペレーターはなく、伝え忘れることもありません。

### 最後の値を見分ける

`settled` はどの Observable にもあるので、購読者も尋ねられます。尋ねるものなので、役に立つのは終わりが値と一緒に来るときです。`take` は最後の値が購読者に届く時点で settled になっていて、`inclusive` を付けた `takeWhile` も、終わりを決めた値を流すので同じです。`inclusive` のない `takeWhile` は、ソースがその時点で settled でない限り、次の値が条件を満たさなくなるまで、その値が最後だと分かりません。そして満たさなかった値は誰にも流しません。これはオペレーターそのもの、または `map` の下にいる購読者についての話です。最後の値を落としうるオペレーター（`filter`）や、後から流すオペレーター（`debounce`、`switchMap`）の下では、最後の値と `settled` がずれることがあります。終わり自体が値を持たないときは、送る側が終わりを値として送ります。iterator の `{ done, value }` や、エラーを運ぶ `Result` と同じ形です。

```tsx
import { createValueEmitter, takeWhile } from 'synstate-next';

const [progress, report] = createValueEmitter<number>();

// `inclusive` passes the value that ends it, so `settled` is already true
// when the subscriber receives that value.
const upload = progress.pipe(takeWhile((p) => p < 100, { inclusive: true }));

const mut_log: string[] = [];

upload.subscribe((p) => {
    mut_log.push(upload.settled ? `done at ${p}` : `${p}%`);
});

report(30);

report(100);

report(40);

assert.deepStrictEqual(mut_log, ['30%', 'done at 100']);

// Or the producer sends the end as a value.
const [transfer, send] =
    createValueEmitter<
        Readonly<{ done: false; percent: number } | { done: true }>
    >();

const mut_transferLog: string[] = [];

transfer.subscribe((t) => {
    mut_transferLog.push(t.done ? 'done' : `${t.percent}%`);
});

send({ done: false, percent: 30 });

send({ done: true });

assert.deepStrictEqual(mut_transferLog, ['30%', 'done']);
```

## それで省けるもの

- **グラフを流れるものは 1 種類です。** 更新が運ぶのは値だけなので、その順序は深さの順序であり、何かを間に挟む必要はありません。
- **オペレーターが短くなります。** オペレーターは `recompute` と、後から値を流すなら `settled` だけです。synstate のオペレーターは、それぞれ値の経路の横に完了の経路を持っていました。
- **信号の伝え忘れによるリークがありません。** 寿命は、ソースから購読者までの間のすべてのオペレーターが完了を正しく伝えることに依存しません。
