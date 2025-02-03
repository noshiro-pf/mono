---
title: 'ESLint, prettier の代替として見たときの Biome についての感想メモ'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['biome', 'eslint', 'prettier', 'typescript']
published: false
---

## Biome のメリット（ユーザー目線）

- 速度：
  - BiomeはRustで書かれており、非常に高速に動作する。
- 統合性：
  - Biome は、リンター、フォーマッター、そして将来的にコンパイラなど、複数の機能を統合している。これにより、ツール間の互換性問題を減らし、開発体験を向上させることができる。
- 設定の簡素化：
  - Biome は、デフォルト設定が優れており、多くのプロジェクトで追加設定なしに利用できる。
  - biome.json でlint ルール等に補完が効くため記述体験が良い。
- より厳密な構文解析：
  - BiomeのパーサはPrettierのパーサよりも厳密に構文を解析する。そのため、より正確にエラーを検出し、コードを整形できる
- ESLint, prettier との比較
  - 後発であるため prettier や ESLint の色々な問題を解決しており将来性がある

prettier plugin recommended config などを超えて ESLint の rule option をがっつり定義したものと比べると（開発思想上納得できるものの）カスタマイズできる余地が少なく機能が現状まだ劣るので使いづらい。

## 執筆時点（2025年2月24日）時点での筆者の結論

ESLint + prettier の方がコードの品質を保つ事に関しては現状 Biome より高機能であるため、当分は実行が遅くても ESLint + prettier を使うことになりそうです。
以前 [ESLint を使い倒す（おすすめルール紹介）](https://zenn.dev/noshiro_piko/articles/take-full-advantage-of-typescript-eslint) という記事で様々な ESLint ルールを紹介しましたが、これらの中には Biome にはまだ実装されていないものや設定が現状多く存在します。既に主要な ESLint plugin から移植済みの lint ルールであっても option が削られているケースも確認しており（どれだったか思い出したら書き足します🙇）、もしかしたらこれが意図的な場合一部の option は今後も追加されないかもしれません。

Biome の基本設定で足りないところを、重複しないように特定のルール設定だけ ON にした ESLint と prettier を併用して補う、という使い方も一応可能ではありますが、ツールの統合・設定の簡素化というメリットはむしろ確実に悪化してしまう上に速度面で得をするのかすら怪しいため、あまり得策とは言えないと思われます。
