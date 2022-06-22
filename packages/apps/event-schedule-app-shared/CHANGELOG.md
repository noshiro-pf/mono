# v7.1

-   io-ts を使うように書き換え
-   テスト追加に伴い `IDate.today()` や `IDate.now()` を使用しないように変更。

# v7

-   EventSchedule.notificationSettings.email を削除（sub collection に移動）

## v6.1

-   各 fill 関数の引数の型を `unknown` に変更
-   変更が多くなったため一旦 types 配下を ~v5 から引き継がずに再作成
-   `EventSchedule` に `archivedBy` を追加

# v6

-   `AnswerSelection` 型に `comment` フィールドを追加。各日程に対する回答にコメントを追加できるようにするため。
-   `EventListItem` 追加

# v5

-   `User` 型を追加
-   `EventSchedule` 内の `useX` フラグ値を削除し、代わりに対応する値を `"none"` との union に変更
-   `EventSchedule` に `author` プロパティを追加
-   `Answer` の `userName: string` プロパティを削除し `user: User` に変更
-   `defaultX` -> `XDefaultValues` にリネーム
-   phantom types の使用を中止（型ユーティリティが望ましくない挙動をしてしまうので）
-   `EventScheduleValidation`と`AnswerTableCellPosition` の削除（frontend でしか使わない型なので）

# v4

-   `Symbol` -> `Icon` にリネーム

# v3

-   〇 △× の id を `'fair' | 'good' | 'poor'` に変更

# v2

-   日付型を `YmdHm` -> `Ymdhm` に変更
