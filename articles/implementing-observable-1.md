---
title: '状態管理ライブラリを自作する方法 第1回'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['javascript', 'typescript', 'observable', 'frontend']
published: false
---

ウェブフロントエンド開発において、状態管理をどうするかは常に主な課題の一つです。

## ウェブフロントエンド状態管理の歴史と「リアクティヴィティ」

ウェブフロントエンドにおける状態管理の本質は「リアクティヴィティをどう実現するか」にあると言えます。

昔の生の JavaScript や jQuery を使って命令的に UI を実装していた時代は、 **値（状態）を更新したときに UI を過不足なく更新すること**に難しさがありました。ある UI 部品の表示に使われる値が変わったときに適切に View に反映しないとJS内の状態と画面が乖離してしまいます。
このとき、一部の状態が変化したときに愚直にDOM全体を再構築し画面全体を再描画することは避けなければなりません（パフォーマンス低下を招くため）。しかし
とする必要がありますが、
自動的に更新することができない

例えばReact の場合は、「`setState` 等をトリガーとしてコンポーネントツリー全体をすべて再評価（再計算）する」という方法によって、あたかもリアクティヴに依存する値が更新されているかのように見せています。

ただ、愚直な再評価だけだとアプリケーションのパフォーマンスが落ちてしまうため、

- DOM への反映は仮想DOMで計算した差分のみ行うように React ランタイムが制御
- `React.memo` で memoize されたコンポーネントは、コンポーネントツリーの再評価時にコンポーネントの引数である props オブジェクトの新旧の値の浅い比較を行い、いずれも値が変わっていなければキャッシュした値を返す
- `React.useMemo` や `React.useCallback` などの React hooks は、コンポーネントの再評価時に依存配列の新旧の値の浅い比較を行い、いずれも値が変化していなければキャッシュした値を返す

などにより

例えば
React の `useState` は、 `setState` をトリガーとして `state` の更新とこの値に依存している値の再評価・ view の更新を行います。正確には、 React は `setState` を

を実行したら React のランタイムが適切に処理をバッチして自動的に更新

<!-- リアクティブプログラミング言語の表を貼る -->
