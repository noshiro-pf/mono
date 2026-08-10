# `just()` の complete 動作に関する設計検討

## 背景

`just(value)` は値を保持した Observable を生成し、即座に `complete()` を呼ぶ。
この「return 前に completed になる」動作が他の API と比較して問題にならないかを検討した。

## `subscribe()` の動作仕様

`ObservableBaseClass.subscribe` (observable-base-class.mts L147-161) の動作:

1. snapshot があれば `onNext(value)` を即座に呼ぶ
2. `isCompleted` なら `onComplete()` を呼んで return（subscriber 登録しない）
3. 未完了なら subscriber を登録

| シナリオ                     | `onNext`  | `onComplete` | subscriber 登録 |
| ---------------------------- | --------- | ------------ | --------------- |
| 未完了 + snapshot あり       | 即座に1回 | -            | される          |
| 未完了 + snapshot なし       | -         | -            | される          |
| **完了済み + snapshot あり** | 即座に1回 | 即座に1回    | **されない**    |
| 完了済み + snapshot なし     | -         | 即座に1回    | されない        |

## `just()` の動作が妥当な理由

- completed 後に subscribe しても snapshot の値が `onNext` で配信され、直後に `onComplete` が呼ばれる。
- subscriber 登録が省略されるため、メモリリークのリスクがない。
- RxJS の `BehaviorSubject` も同様に、completed 後の subscribe で最後の値 + complete 通知を受ける。

## `switchMap` 内での使用（主要ユースケース）

```ts
auth$.pipe(
  switchMap((auth) =>
    auth ? fromAbortablePromise(...) : just(guestData),
  ),
);
```

1. `switchMap` が `just(guestData)` を subscribe
2. `onNext(guestData)` が即座に配信 → `switchMap` が下流に emit
3. `onComplete()` で inner subscription 完了

意図通りの動作。

## constructor と `complete()` の間にコードが差し込まれるリスク

`just()` は同期的に `new RootObservableClass()` → `obs.complete()` → `return` を実行するため、
ユーザーコードが間に入る余地はない。

## `source(value)` との違い

- `source(value)`: completed しない。`next()` で値を変更できる。
- `just(value)`: immutable な単一値 observable。completed 済みなので値の変更不可。

## `complete()` による subscriber clear の影響

`complete()` は subscriber map を clear する (observable-base-class.mts L130)。
`just` の場合は初期値が snapshot として保持されているため、
completed 後に `.pipe()` で子を繋いでも子の constructor が snapshot を読める。

## 結論

`just` の「return 前に complete する」動作は、`subscribe()` の仕様（completed でも snapshot を配信する）により正しく機能する。設計上の問題はない。
