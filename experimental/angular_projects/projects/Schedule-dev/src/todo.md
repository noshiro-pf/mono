- テキストボックス component change と input で発火する output をそれぞれ用意

- spreadsheet component sorted を RN に

- takewhile いるのかチェック

- bug fix

  - edit-event.component title の取得に失敗する問題

- リファクタリング
  - value で取得できるものをテンプレート経由引数から削除
  - constructor 内に初期化処理を書かない（初期化前読み取りチェックが働かないため）
  - `XXFromUI$` という名前の変数名に
  - RN に readonly をつける
