# Event Schedule App

イベントの日程調整のためのアプリ

https://event-schedule-app.web.app

## ToDo

-   high
    -   firestore バックアップ
-   middle
    -   フィードバック機能
    -   イベント設定編集時に表示される Email 確認ダイアログで Email をリセット可能にする
        -   checkbox
        -   誰でもリセットできてしまうので、firebase functions で通知
-   low
    -   時差対応
        -   "2020/1/1 1:00~3:00" を -2 時間の地域で表示するときの UI は "2019/12/31 23:00~（翌）1:00" のようにする
    -   （多言語対応）
    -   （イベント作成画面登録時チェック）
        -   回答期限が最も近い候補日より後に設定されているとき
    -   （開始日～終了日による候補日程選択）
    -   イベント作成中ダイアログ
        -   作成が完了しないまま一定時間経った場合キャンセルボタンを表示する
        -   エラー表示
    -   （記号の追加）
        -   popover の実装
        -   カスタムアイコンが disabled で灰色にならない問題
    -   回答画面
        -   （スマホ用表示）
        -   回答一覧テーブルの行・列固定表示
-   dev
    -   firebase emulator を使うようにする
    -   texts の整理
    -   component test

## links (memo)

-   https://firebase.google.com/docs/emulator-suite/install_and_configure#configure_emulator_suite
-   https://firebase.google.com/docs/emulator-suite/connect_firestore?hl=ja#web
-   https://blog.nismit.me/post/2020/06/create-firebase-nodemailer/
-   https://holidays-jp.github.io/
