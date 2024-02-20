---
title: '状態管理ライブラリを自作する方法 第2回'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['javascript', 'typescript', 'observable', 'frontend']
published: false
---

第1回で実装した Observable ベースの状態管理ライブラリは既に実用的なものですが、初期値の記述が冗長であるという点にやや不満があります。

そこで、第2回では `InitializedObservable` の実装とこれを使った関数オーバーロードにより初期値の記述を簡潔に行うことができるよう、ライブラリを改善していきます。
