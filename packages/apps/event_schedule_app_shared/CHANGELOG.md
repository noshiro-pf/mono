# v6

-   `AnswerSelection` 型に `comment` フィールドを追加。各日程に対する回答にコメントを追加できるようにするため。

# v5

-   `User` 型を追加
-   `EventSchedule` 内の `useX` フラグ値を削除し、代わりに対応する値を `"none"` との union に変更
-   `EventSchedule` に `author` プロパティを追加
-   `Answer` の `userName: string` プロパティを削除し `user: User` に変更
-   `defaultX` -> `XDefaultValues` にリネーム
-   phantom types の使用を中止（型ユーティリティが望ましくない挙動をしてしまうので）

# v4

-   `Symbol` -> `Icon` にリネーム

# v3

-   〇 △× の id を `'fair' | 'good' | 'poor'` に変更

# v2

-   日付型を `YmdHm` -> `Ymdhm` に変更
