---
title: synstate-dom からの変更点
description: synstate-dom のアプリケーションを synstate-dom-next と synstate-next に移すときに変わること。
---

synstate-dom-next は synstate-dom のモデルと API のほとんどを引き継いでいます。1 回だけ呼ばれるコンポーネント、`Bindable` の props と属性、`constant`、`If`、`MatchOptional`、`MatchResult`、`For`、`Portal`、`mapBindable`、`deriveBindable`、`toObservable`、`listenInScope`、`createAfterUpdate` は同じように使えます。このページでは、synstate-dom-next と、その下の synstate-next で違うところを挙げます。

## synstate-dom-next で

- **束縛は更新のすべての値が新しくなった後で**、伝播中の購読者としてではなく、更新ごとに 1 回実行されます。`If`・`Switch`・`For` のマウントとアンマウントは、伝播の外で行われます。
- **外れる分岐や行が、それを外す値で計算することはありません。** 決定は更新の中で、分岐のノードを訪れる前に行います（[仕組み](/mono/synstate-dom-next/ja/background/how-it-works/#分岐のコンポーネントは分岐が計算する前に決める)）。
- **`For` の行が新しい要素を読むのは**、`items` が変わった 1 つ後の更新で、描画より前です。要素が変わらなかった行は訪れません。
- **`Switch` を公開しました。** `If`・`MatchOptional`・`MatchResult` を書くのに使っている、キー付きの切り替えです。
- **要素の名前空間は、タグではなくマウントされる場所で決まります。** `<svg>` の中では、`<foreignObject>` までの `<a>` や `<title>` は SVG の要素です。synstate-dom ではどこにあっても HTML になります。props の型は HTML のままです。
- **Observable を束縛した分岐のコンポーネントは、両端のコメントで示します。** synstate-dom は後ろに 1 つ置きます。constant を渡した分岐のコンポーネントは、コメントなしで分岐をマウントします。
- **イベントハンドラは、要素が持っていれば `on…` プロパティ**、持っていなければリスナーです。要素は owner と一緒に消えるので、どちらも取り外しません。
- **失敗はその場にとどまります。** `For` の行や分岐の後始末が例外を投げても、更新もほかの破棄も止まりません。例外は行と分岐が置かれた後に投げられます。マウント中に例外を投げた行は、その更新で作った行を取り除き、ほかの行は残します。例外を投げた分岐は、次の値まで分岐のコンポーネントを空にします。例外を投げた束縛は、同じ更新のほかの束縛を止めません。
- **制御された `checked` と `indeterminate`** は、`change` の後、次のアニメーションフレームかタスクの早い方で戻します。そのため非表示のページでも戻ります。
- **`subscribeInScope` はなくなりました。** owner の実行中に行った `subscribe` は、もともとその owner に属します。
- **`inlineMap` は作り直していません。** synstate-dom でも削除済みです。
- **低レベル API は小さくなりました。** `mountable(mount)` はノードを返す関数を受け取り、`mountChild(child, parent?)` は子を専用の owner の中でマウントしてノードを返し、`parent` を渡せばその名前空間でそこに追加します。`isChild` は残っています。`toNodes`、`createMountable`、型 `Mountable` と `MountedNodes` はなくなりました（[低レベル API](/mono/synstate-dom-next/ja/guides/low-level/)）。
- **`MatchOptional` と `MatchResult` の `Optional` と `Result`** は ts-std-forge のものです。

## synstate-next で

synstate-dom で書いたアプリケーションが最初に出会う変更です。すべての変更は synstate-next の [DESIGN.md](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-next/DESIGN.md#breaking-changes-against-synstate) にあります。

- **スコープは owner になりました。** `createScope` は `createOwner`、`getCurrentScope` は `getOwner`、`onScopeDispose` は `onCleanup` です。
- **購読者はすべての値が新しくなった後で実行され**、伝播中の書き込みは伝播が終わるまで待ちます。更新は入れ子にならないので、別の状態の伝播中に書き込んだときの警告もありません。書き込みは単に次に適用されます。
- **`complete` はなくなりました。** Observable は owner と一緒に破棄されることで終わります。終わったソース（発火した `timer`、解決した `fromPromise`）は、owner に破棄されるまで値を持ち続けます。
- **`createState` のセッターは何も返しません。** 状態は `getSnapshot` か、Observable の `.value` で読みます。
- **`subscribe` は購読を止める関数を返します**（`{ unsubscribe }` オブジェクトではありません）。
- **1 つの `map` で書けるオペレーターはなくなりました**（`mapTo`、`pluck`、`getKey`、`attachIndex`、`mapOptional`、`unwrapOptional`、`mapResultOk` など）。別名（`combineLatest`、`distinctUntilChanged`、`withLatestFrom`、`flatMap`）もなくなりました。`combine` もなくなり、タプルは `derive([a, b], (x, y) => [x, y] as const)` で得られます。
- **`timer` と `counter` は作ったときに始まります。** 止めるべき owner の中で作ってください。
- **パッケージの 2 つのコピーの Observable は組み合わせられず**、束縛もできません。
