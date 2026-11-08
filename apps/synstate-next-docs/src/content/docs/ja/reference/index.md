---
title: すべての API
description: synstate-next の公開 API を用途ごとに並べ、それぞれのページへ案内します。
---

各ページには、API の説明と、テストとして実行している例を載せています。オペレーターのページには `pipe` が結果をどう扱うかも書き、多くのページでは、テストがオペレーター自身と照らし合わせて検査したマーブル図を描いています。

<!-- reference:api-list -->

## 状態

- [`createState`](/mono/synstate-next/ja/reference/state/create-state/): observable・セッター・その他の操作をタプルにした状態です。
- [`createReducer`](/mono/synstate-next/ja/reference/state/create-reducer/): `dispatch` からだけ、`reducer` を通して書き込む状態です。
- [`createBooleanState`](/mono/synstate-next/ja/reference/state/create-boolean-state/): `setTrue`・`setFalse`・`toggle` を持つ真偽値の状態です。
- [`state`](/mono/synstate-next/ja/reference/state/state/): `initial` を持つ状態を作ります。

## イベント

- [`createValueEmitter`](/mono/synstate-next/ja/reference/events/create-value-emitter/): `A` のイベントソースと、そこに値を流す関数です。
- [`createEventEmitter`](/mono/synstate-next/ja/reference/events/create-event-emitter/): `undefined` のイベントソースと、それを流す関数です。
- [`source`](/mono/synstate-next/ja/reference/events/source/): イベントソースを作ります。

## ソース

- [`just`](/mono/synstate-next/ja/reference/sources/just/): `value` を持ち、決着済みで、値を流すことはありません。
- [`empty`](/mono/synstate-next/ja/reference/sources/empty/): 何も持たず、決着済みで、値を流すことはありません。
- [`fromPromise`](/mono/synstate-next/ja/reference/sources/from-promise/): `promise` の結果を `Result.ok(value)` か `Result.err(error)` として、独立した更新で 1 回だけ流し、決着します。
- [`fromAbortablePromise`](/mono/synstate-next/ja/reference/sources/from-abortable-promise/): `factory` を `AbortSignal` 付きで呼び、それが返す Promise の結果を `fromPromise` と同じように流します。
- [`fromSubscribable`](/mono/synstate-next/ja/reference/sources/from-subscribable/): `subscribable` を追いかけ、値をそれぞれ `Result.ok(value)`、エラーを `Result.err(error)` として流します。
- [`timer`](/mono/synstate-next/ja/reference/sources/timer/): 作られてから `milliseconds` 後に `0` を 1 回流し、決着します。
- [`counter`](/mono/synstate-next/ja/reference/sources/counter/): 作られた次のタスクで `0` を流し（`emitInitial: false` なら 1 間隔後に `1`）、その後 `milliseconds` ごとに次の整数を流します。
- [`createSource`](/mono/synstate-next/ja/reference/sources/create-source/): 他のライブラリやイベントから自分で値を流すソースを作ります。

## 組み合わせ

- [`combine`](/mono/synstate-next/ja/reference/combining/combine/): `parents` の最新の値をタプルにしたものです。
- [`derive`](/mono/synstate-next/ja/reference/combining/derive/): `parents` の値から `fn` を計算し、持っている値と等しくなければ結果を流します。
- [`merge`](/mono/synstate-next/ja/reference/combining/merge/): この更新で値を流した親の値を流します（複数あれば最初のもの）。
- [`zip`](/mono/synstate-next/ja/reference/combining/zip/): すべての `parents` がそれぞれ `n` 番目の値を流したところで、その `n` 番目の値をタプルにして流します。

## オペレーター

- [`map`](/mono/synstate-next/ja/reference/operators/map/): 各値を `fn` で変換し、結果が持っている値と等しくなければ流します（`equals` を渡さなければ `Object.is` で比べます）。
- [`filter`](/mono/synstate-next/ja/reference/operators/filter/): `predicate` を満たす値を流します。
- [`scan`](/mono/synstate-next/ja/reference/operators/scan/): `seed` から始めて、値を `reducer` で畳み込みます。
- [`pairwise`](/mono/synstate-next/ja/reference/operators/pairwise/): ソースの直前の値と今の値をペアにして、2 つ目以降の値のたびに流します。
- [`take`](/mono/synstate-next/ja/reference/operators/take/): ソースの最初の `count` 個の値を、最初に持っている値も含めて流し、その後は何も流さず、最後に流した値を持ち続けます。
- [`skip`](/mono/synstate-next/ja/reference/operators/skip/): ソースの最初の `count` 個の値を、最初に持っている値も含めて捨て、残りを流します。
- [`takeWhile`](/mono/synstate-next/ja/reference/operators/take-while/): `predicate` が成り立つ間、ソースの値を流します。
- [`skipWhile`](/mono/synstate-next/ja/reference/operators/skip-while/): `predicate` が成り立つ間、ソースの値を捨てます。
- [`takeUntil`](/mono/synstate-next/ja/reference/operators/take-until/): `notifier` が値を流すまでソースを追いかけ、その後は何も流さず、最後に流した値を持ち続けます。
- [`skipUntil`](/mono/synstate-next/ja/reference/operators/skip-until/): `notifier` が値を流すまで何も流さず、その後はソースのすべての値を流します。
- [`skipIfNoChange`](/mono/synstate-next/ja/reference/operators/skip-if-no-change/): 持っている値と等しい値を捨てます（`equals` を渡さなければ `Object.is` で比べます）。
- [`keepEqualParts`](/mono/synstate-next/ja/reference/operators/keep-equal-parts/): 各値のうち、持っている値と深く等しい部分を、持っている値のものに置き換えます。
- [`withInitialValue`](/mono/synstate-next/ja/reference/operators/with-initial-value/): ソースが値を流すまでは `initial` を持ち、その後はソースを追いかけます。
- [`withCurrentValueFrom`](/mono/synstate-next/ja/reference/operators/with-current-value-from/): ソースの各値を、同じ更新で落ち着いた `other` の値とペアにします。
- [`withBufferedFrom`](/mono/synstate-next/ja/reference/operators/with-buffered-from/): ソースの各値に、直前の値から後に `other` が流した値を順に付けます。
- [`debounce`](/mono/synstate-next/ja/reference/operators/debounce/): `milliseconds` の間ほかの値が来なかったところで、最新の値を独立した更新で流します。
- [`throttle`](/mono/synstate-next/ja/reference/operators/throttle/): 値をすぐに流し、その後 `milliseconds` の間に来た値は捨てます。
- [`audit`](/mono/synstate-next/ja/reference/operators/audit/): 値が来ると `milliseconds` 待ち、その時点の最新の値を独立した更新で流します。
- [`switchMap`](/mono/synstate-next/ja/reference/operators/switch-map/): 最新の値に対して `project` が返す Observable を追いかけます。
- [`mergeMap`](/mono/synstate-next/ja/reference/operators/merge-map/): `project` が返すすべての Observable を追いかけ、どれかが流した値を流します。
- [`createDerived`](/mono/synstate-next/ja/reference/operators/create-derived/): `parents` を追いかける Observable を作ります。

## 更新と寿命

- [`batch`](/mono/synstate-next/ja/reference/lifetime/batch/): `fn` を実行し、その中の書き込みを、戻ったところで 1 回の更新として伝えます。
- [`createOwner`, `createRootOwner`, `getOwner`, `onCleanup`, `untracked`, `Owner`](/mono/synstate-next/ja/reference/lifetime/owners/): 現在の owner、owner の作成と破棄、後始末の登録。
- [`isObservable`](/mono/synstate-next/ja/reference/lifetime/is-observable/): `value` が、このパッケージのこのコピーの Observable かどうかを返します。

<!-- /reference -->
