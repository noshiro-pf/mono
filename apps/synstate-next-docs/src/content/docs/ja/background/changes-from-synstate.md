---
title: synstate からの変更点
description: synstate-next で振る舞いが変わったものすべてと、代わりに書くもの。
---

synstate-next は、次のメジャーバージョンで synstate を置き換えます。このページでは、synstate 向けに書いたプログラムが変えなければならないことを挙げます。理由は[更新の伝わり方](/mono/synstate-next/ja/internals/how-an-update-propagates/)と[完了がない理由](/mono/synstate-next/ja/internals/why-no-completion/)にあります。

## 値の読み方と購読

- **`getSnapshot()` は、値か、値がなければ `undefined` を返します。** `Optional` は返しません。値を持つかどうかは `hasValue` でわかり、`InitializedObservable` には `.value` があります。
- **`subscribe` は、購読を止める関数を返します。** `{ unsubscribe }` オブジェクトではありません。
- **`kind`・`depth`・`updateToken` は公開されていません。** 更新の順番は今もノードの深さで決まりますが、それはライブラリの内部のものです。`isCompleted` は `settled` になりました。下の `complete` の項を見てください。

## 伝播と書き込み

- **購読者は、更新の途中ではなく、すべての値が新しくなった後で実行されます。** 購読者がグラフの他の値を読めば、それは最新です。ただし、同じ更新で先に動いた購読者が書き込んだときは別です（次の項目）。
- **更新が値を計算し直している間に `map` や `derive` などのオペレーターの中で行った書き込みは、その更新の購読者と束縛が実行されるまで遅らせます。** その後、次の更新を始めます。購読者や束縛からの書き込みはすぐに適用され、次の更新で伝わります。同じ更新でその後に動く購読者は、状態の新しい値と、そこから派生したまだ古い値を読みます。更新が入れ子になることはありません。
- **セッターは何も返しません。** `createState` の `setState`・`updateState`・`resetState`、`createReducer` の `dispatch`、`createBooleanState` のものです。更新が値を計算し直している間に `map` や `derive` などのオペレーターの中で行った書き込みはその更新の購読者と束縛が実行されてから適用されるので、返すべき値はまだ決まっていません。状態は `getSnapshot` で読んでください。
- **循環依存は検出しません。** ノードの親はノードより先に存在するので、API を通して循環を作ることはできません。

## 寿命

- **`complete` はなくなりました。** Observable は破棄されることで終わります。`subscribe` が取る関数は 1 つで、`onComplete` はありません。`isCompleted` の代わりは `settled` で、true になるのが早まります。`take` や `inclusive` を付けた `takeWhile` は、最後の値が購読者に届く時点で settled になっています。synstate では完了はその値の後でした。購読者はこれを読んで最後の値を見分けます。終わり自体が値を持たないときは、終わりを値として送ります（[完了がない理由](/mono/synstate-next/ja/internals/why-no-completion/#最後の値を見分ける)）。
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
- **別名はなくなりました。** `withLatestFrom`（`withCurrentValueFrom`）、`withBuffered`（`withBufferedFrom`）、`distinctUntilChanged`（`skipIfNoChange`）、`flatMap`（`mergeMap`）です。
- **`combine` はなくなりました。** `derive` は複数の Observable から 1 つの値を計算します。引数をタプルにして返す `fn` を渡した `derive([a, b], (x, y) => [x, y] as const)` で、タプルそのものが得られます。別名の `combineLatest` も一緒になくなりました。

## ソースとヘルパー

- **`fromSubscribable` はオブザーバーオブジェクト**（`next`・`error`・`complete`）で購読します。RxJS が推奨し TC39 の `Observable` が受け取る形で、3 つの関数ではありません。
- **状態はオブジェクトとしても作れます。** `state(initialValue)` は `.value`・`.set`・`.update` を持ち、`createState` は同じものをタプルで返します。
- **`source()` は `.next` ではなく `.emit` で発火します。**
- **`source(initialValue)` はなくなりました。** `source()` は引数を取らず、最初の `emit` まで値を持ちません。初めから値を持つソースは状態です。`state(initialValue)` は持っている値と等しい書き込みを流さず、1 回の更新の前に行った書き込みをまとめて 1 つとして流します。synstate の初期値付きソースのようにすべての書き込みを届ける必要があるときは、`source()` で発火し、`withInitialValue(initialValue)` を通して読みます。synstate の `.next` は書き込んだ値を返しましたが、`.set`・`.update`・`.emit` は何も返しません。
- **Observable・状態・ソースの関数はメソッドとして型付けされています。** `getSnapshot`・`subscribe`・`pipe`・`dispose`・`set`・`update`・`emit` は `this` を宣言するので、オブジェクトから取り出したもの（`const { set } = count`）や、独自の `this` を型に持つ呼び出し先（`subscribe`・`onCleanup`・synstate-dom-next のイベントハンドラー）に渡したものを TypeScript が拒否します。synstate のものもメソッドでしたが、ただの関数として型付けされていたので、呼び出したときに例外になりました。単独で渡すときは包みます: `(value) => { count.set(value); }`。

## オペレーターを書く

- **ファクトリーはそれぞれ 1 つです。** オペレーターは `createDerived`（synstate の `createSyncChildObservable`・`createAsyncChildObservable`・`createInitializedSyncChildObservable`）、ソースは `createSource`（`createRootObservable`）です。
- **更新トークンはありません。** その更新でどの親が値を流したかは `ctx.emitted(parent)` でわかり、`ctx.set` はその更新で値を伝え、`ctx.emit` はそれ自身の更新で伝えます。
- **`settled` が `canEmitNoMore` に代わり**、`flush` は完了とともになくなりました。
- **setup は Observable を owner として実行されます。** そこで作ったものは Observable に属し、クリーンアップは新しいものから、作ったものを破棄する前に実行されます。synstate は登録順に実行していました。
- **`WithInitialValueOperator` は `ProvideInitialValueOperator` になりました。** ほかの 2 つのオペレーターの型、`KeepInitialValueOperator`・`DropInitialValueOperator` と同じく動詞です。
- **`isChildObservable`・`isManagerObservable`・`isRootObservable` の型ガードはなくなりました。** それらが区別していた種類は公開の型にありません。

## 型

- **`ObservableValue` は残り、Observable の型だけを受け取ります。** `ObservableValue<Observable<number> | undefined>` はエラーです。synstate では `undefined` が落とされていました。また `ObservableValue<never>` は `never` ではなく `unknown` です。
- **名前が変わった型があります。** `Subscription` は `subscribe` が返す関数の型 `Unsubscribe` に、`Scope` は `Owner` に、`Unwrap` は `ValuesOf` に、`SourceObservable` は `Source` になりました。オペレーターやソースを書くための型（`RootObservableConfig`・`RootObservableTools`・`ChildObservableConfig`・`SyncChildObservableHooks`・`SyncChildObservableTools`・`AsyncChildObservableHooks`・`AsyncChildObservableTools`）は、`SourceContext`・`DerivedContext`・`DerivedBehavior` になりました。
- **なくなった型があります。** `Subscriber` は `onComplete` とともに、`InitializedSourceObservable` は `source(initialValue)` とともになくなりました。Observable の種類ごとの型（`ObservableBase`・`ObservableKind`・`RootObservable`・`ChildObservable`・`ManagerObservable`・`TimerObservable`・`MapOperatorObservable` など）は、Observable が `Observable` か `InitializedObservable` のどちらかになったのでなくなりました。`Operator` は、オペレーターを 3 つのオペレーター型のどれかで表すのでなくなりました。`UpdateToken` と `TimerId`、補助の型 `Wrap`・`WrapInitialized`・`NonEmptyUnknownList`・`TupleToQueueTuple` もなくなりました。

## 1 つのプログラムに 1 つのコピー

パッケージの 2 つのコピーの Observable は組み合わせられません。別のコピーの Observable を渡すと、グラフが例外を投げます。

## synstate-dom を使っている場合

UI 層の変更点は、synstate-dom-next の [synstate-dom からの変更点](/mono/synstate-dom-next/ja/background/changes-from-synstate-dom/)にあります。
