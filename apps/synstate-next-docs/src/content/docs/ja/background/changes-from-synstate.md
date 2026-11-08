---
title: synstate からの変更点
description: synstate-next で振る舞いが変わったものすべてと、代わりに書くもの。
---

synstate-next は、次のメジャーバージョンで synstate を置き換えます。このページでは、synstate 向けに書いたプログラムが変えなければならないことを挙げます。理由は[更新の伝わり方](/mono/synstate-next/ja/internals/how-an-update-propagates/)と[完了がない理由](/mono/synstate-next/ja/internals/why-no-completion/)にあります。

## 伝播と書き込み

- **購読者は、更新の途中ではなく、すべての値が新しくなった後で実行されます。** 購読者がグラフの他の値を読めば、それは最新です。ただし、同じ更新で先に動いた購読者が書き込んだときは別です（次の項目）。
- **更新が値を計算し直している間に `map` や `derive` などのオペレーターの中で行った書き込みは、その更新の購読者と束縛が実行されるまで遅らせます。** その後、次の更新を始めます。購読者や束縛からの書き込みはすぐに適用され、次の更新で伝わります。同じ更新でその後に動く購読者は、状態の新しい値と、そこから派生したまだ古い値を読みます。更新が入れ子になることはありません。
- **セッターは何も返しません。** `createState` の `setState`・`updateState`・`resetState`、`createReducer` の `dispatch`、`createBooleanState` のものです。更新が値を計算し直している間に `map` や `derive` などのオペレーターの中で行った書き込みはその更新の購読者と束縛が実行されてから適用されるので、返すべき値はまだ決まっていません。状態は `getSnapshot` で読んでください。
- **循環依存は検出しません。** ノードの親はノードより先に存在するので、API を通して循環を作ることはできません。

## 寿命

- **`complete` はなくなりました。** Observable は破棄されることで終わります。`subscribe` が取る関数は 1 つで、`onComplete` はありません。
- **スコープは owner になりました。** `createScope` は `createOwner`、`getCurrentScope` は `getOwner`、`onScopeDispose` は `onCleanup` です。`createRootOwner` は親のない owner を作り、`untracked` は owner なしで関数を実行します。
- **済んだソースは、完了するのではなく settled になります。** 発火した `timer`、resolve した `fromPromise`、購読対象が完了した `fromSubscribable` は、owner に破棄されるまで値と購読者を保ちます。
- **破棄されたノードから作ったノードは、すぐに settled になり**、親の最後の値から計算した値を持ちます。
- **`collectToArray` はなくなりました。** 完了で resolve していたからです。
- **`timer` と `counter` は作った時点で始まります。** `startManually` と `start()` はなくなりました。止めるべき owner の中で作ってください。

## オペレーター

- **`take(n)` と `skip(n)` は、ソースが最初に持っている値も数えます。** `state(0).pipe(take(1))` は `0` を持ち、その後は何も流しません。synstate はその後の値だけを数えていました。
- **`takeUntil` と `skipUntil` は、作られた後の notifier の流出に反応します。** notifier がすでに持っている値は流出ではありません。notifier が流したのと同じ更新でソースが流した値は、`takeUntil` では落とし、`skipUntil` では通します。
- **`withBufferedFrom` は、作られた後に相手が流したものを溜めます。** synstate は、相手が持っていた値を最初のバッファに入れていました。
- **`filter` と `skipWhile` の述語が受け取るのは値だけで**、添字は受け取りません。数えるなら `scan` です。
- **1 つの `map` で書けるオペレーターはなくなりました。** `mapTo`（イベントに対する `equals: () => false` 付きの `map`）、`pluck` と `getKey`、`attachIndex` と `withIndex`（`scan`）、`mapOptional`・`unwrapOptional`・`mapResultOk`・`mapResultErr`・`unwrapResultOk`・`unwrapResultErr` です。
- **別名はなくなりました。** `withLatestFrom`（`withCurrentValueFrom`）、`withBuffered`（`withBufferedFrom`）、`combineLatest`（`combine`）、`distinctUntilChanged`（`skipIfNoChange`）、`flatMap`（`mergeMap`）です。
- **`pipe` が取るオペレーターは 4 つまでです。** それより多ければ `pipe` をもう一度つなぎます。

## ソースとヘルパー

- **`fromSubscribable` はオブザーバーオブジェクト**（`next`・`error`・`complete`）で購読します。RxJS が推奨し TC39 の `Observable` が受け取る形で、3 つの関数ではありません。
- **状態はオブジェクトとしても作れます。** `state(initial)` は `.value`・`.set`・`.update` を持ち、`source()` は `.next` を持つイベントです。`createState` やエミッターは、同じものをタプルで返します。

## オペレーターを書く

- **ファクトリーはそれぞれ 1 つです。** オペレーターは `createDerived`（synstate の `createSyncChildObservable`・`createAsyncChildObservable`・`createInitializedSyncChildObservable`）、ソースは `createSource`（`createRootObservable`）です。
- **更新トークンはありません。** その更新でどの親が値を流したかは `ctx.emitted(parent)` でわかり、`ctx.set` はその更新で値を伝え、`ctx.emit` はそれ自身の更新で伝えます。
- **`settled` が `canEmitNoMore` に代わり**、`flush` は完了とともになくなりました。
- **setup は Observable を owner として実行されます。** そこで作ったものは Observable に属し、クリーンアップは新しいものから、作ったものを破棄する前に実行されます。synstate は登録順に実行していました。
- **`isChildObservable`・`isManagerObservable`・`isRootObservable` の型ガードはなくなりました。** それらが区別していた種類は公開の型にありません。

## 1 つのプログラムに 1 つのコピー

パッケージの 2 つのコピーの Observable は組み合わせられません。別のコピーの Observable を渡すと、グラフが例外を投げます。

## synstate-dom を使っている場合

UI 層の変更点は、synstate-dom-next の [synstate-dom からの変更点](/mono/synstate-dom-next/ja/background/changes-from-synstate-dom/)にあります。
