# Event Schedule App

イベントの日程調整のためのアプリ

## ToDo

-   イベント作成画面
    -   記号の設定
        -   popover の実装
        -   カスタムアイコンが disabled で灰色にならない問題
    -   作成ボタン等
    -   登録時チェック
        -   時刻開始・終了は選択していないデータは 0 埋めする
        -   空欄が無いか
        -   回答期限が最も近い候補日より後に設定されているとき
-   全体
    -   utils
        -   カレンダー祝日色
        -   multiple date picker に today ボタン追加
    -   データベース
    -   refactoring
        -   texts 整理
        -   utils からの import を整理
