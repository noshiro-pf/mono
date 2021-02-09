* テキストボックスcomponent changeとinputで発火するoutputをそれぞれ用意

* spreadsheet component sortedをRNに

* takewhileいるのかチェック

* bug fix
  * edit-event.component titleの取得に失敗する問題

* リファクタリング
  * valueで取得できるものをテンプレート経由引数から削除
  * constructor内に初期化処理を書かない（初期化前読み取りチェックが働かないため）
  * `XXFromUI$` という名前の変数名に
  * RNにreadonlyをつける
