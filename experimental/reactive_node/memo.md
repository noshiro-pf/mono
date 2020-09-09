# ReactiveNode 設計

## links

- https://www.learnrxjs.io/operators/creation/interval.html
- https://github.com/noshiro-pf?tab=repositories

## RxJS より良くしたいこと

- glitch が起きないようにする
- hot Observable のみによるサブセットにする（cold/hot どちらであるかを把握するコストが無駄）
- 合成系関数や pipe の型定義をちゃんと当てる（RxJS の`combineLatest`などは引数が 7 個以上になると any になってしまう）

## rnjs より良くしたいこと

- rnjs では初期値必須にしていたが、今回は初期値不要にする。（面倒なので）
- glitch を起こさないための priority queue の使用をやめ、パフォーマンスを改善する。
- RxJS のインターフェイスをすべて実装する。

## インターフェイス

- ゼロから新しく RNode を作成する関数（`interval`・`from`・`fromEvent`・`timer`・`of`）
- 既存の RNode に pipe でオペレーターを施した RNode を作る
- 2 個以上の RNode を合成した RNode を生成する関数（`combineLatest`・`merge`）
- RNode に対する subscriber の登録
- 既存の RNode に

## 内部設計

- 要素
  - RNode = RxJS における Observable
  - sync operator と async operator
- 動作
  - update ＝ 値の更新 ＋ subscriber への通知
  - fire ＝ update ＋ 子孫ノードの発火
  - ある RNode`n`から sync operator または合成（`combineLatest` or `merge`）のみで作られる子 RNode 全体は、`n`が主体となって値を更新する。
    - subscriber には通知する必要がある
  - ある RNode`n`から async operator で作られる子 RNode 全体には更新シグナルを送る。
  - pipe 無しでオペレーターをつなげる方法も用意する（内部動作は同じ）
  - 各 RNode は親 RNode への参照`parents`を持つ
  - 子 RNode が追加されるときに祖先ノードの `syncChildren` または `asyncChildren` に再帰的に自身を追加する。
    - sync operator を施して作られた RNode なら `syncChildren` に、async operator ならば `asyncChildren` に追加する。
    - 同じ要素が複数追加されないようにする。
    - RNode の深さでソートされた状態にする（この処理は初期ロード時のみしか発生しないのでデータ構造は単に配列を利用し二分探索で挿入する）
