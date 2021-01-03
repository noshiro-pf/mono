# Event Schedule App

イベントの日程調整のためのアプリ

## ToDo

-   high
    -   イベント設定編集
        -   通知メールアドレスを設定した場合は編集時パスワードをおすすめするようにする
-   middle
    -   エラーハンドリング正確に（not found とそのほかのエラーの区別）
    -   フィードバック機能
-   low
    -   イベント作成画面登録時チェック
        -   回答期限が最も近い候補日より後に設定されているとき
    -   （開始日～終了日による候補日程選択）
    -   （多言語対応）
    -   イベント作成中ダイアログ
        -   作成が完了しないまま一定時間経った場合キャンセルボタンを表示する
        -   エラー表示
    -   記号の設定
        -   popover の実装
        -   カスタムアイコンが disabled で灰色にならない問題
    -   回答画面
        -   （スマホ用表示）
        -   回答一覧テーブルの行・列固定表示
-   dev
    -   firebase emulator を使うようにする
    -   texts の整理

## links (memo)

-   https://firebase.google.com/docs/emulator-suite/install_and_configure#configure_emulator_suite
-   https://firebase.google.com/docs/emulator-suite/connect_firestore?hl=ja#web
-   https://blog.nismit.me/post/2020/06/create-firebase-nodemailer/
-   https://holidays-jp.github.io/
