---
title: 'TypeScript の satisfies オペレーターの使いどころ'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['typescript']
published: false
---

本記事の内容は TypeScript 5.4 時点で確認したものです。

- 変数に付ける型を緩くすることなく制約を満たすかチェック
  - `as const satisfies` で定数定義
- JSX の menu の value など
- 一時変数を作ることなく部分的な型注釈を追加
- 型注釈を増やすことでコードの可読性向上
  - router のパスなど

```ts
const f = () => {
  const a: A = { x: 1 };

  return [a, 0];
};
```
