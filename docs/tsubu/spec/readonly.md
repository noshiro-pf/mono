# readonly-by-default 戦略

## 目標

`readonly` キーワードや `Readonly<*>` を書かなくても**デフォルトで readonly** になり、可変にしたい場合だけ `mutable` キーワードを明示する型システムにしたい。

```text
// v2 で目指す姿(スケッチ)
type A = { x: number; xs: number[] };          // すべて readonly と解釈される
type B = { mutable x: number; xs: mutable number[] }; // 可変には mutable を明示
```

## なぜ v1 では実現できないか

readonly-by-default は「TS と同じ字面に TS と違う意味を与える」ことであり、[decisions.md](../decisions.md) D-2 が禁じる意味の再解釈にあたる。具体的に破綻する例:

- チェッカーが無注釈の `number[]` を readonly と解釈しても、コードは依然 tsc を通る必要がある。readonly と「解釈した」値を tsc が `number[]` と見なす箇所に渡すのは tsc 的には合法なので、チェッカーが検出しない mutation 経路が残る。逆に、本当に readonly な値を受け取るよう署名を直すと、今度は書いた字面が意味を持ってしまい「デフォルト readonly」ではなくなる。
- `.d.ts` を見る外部の消費者(この言語を使わない TS ユーザー)には再解釈が届かず、公開 API の型が嘘になる。

## v1 の規則: readonly 注釈の全箇所強制(確定方針)

v1 では逆向きのアプローチを取る — **readonly を省略可能にするのではなく、省略を禁止する**。

- 配列は常に `readonly T[]`、タプルは `readonly [A, B]`。
- オブジェクト型のプロパティは常に `readonly`(`Readonly<{...}>` / `DeepReadonly<...>` 可)。
- 可変にしたい場所は素の型を書き、変数側の `mut_` prefix と組み合わせる([variables-and-mutation.md](./variables-and-mutation.md))。

これは eslint-config-typed が既に強制している内容(`functional/prefer-readonly-type` 系)と一致する。

## この設計が v2 への codemod を可能にする(D-3 の適用)

v1 で readonly 注釈が**全箇所に存在する**からこそ、v2 で readonly をデフォルト化するとき:

1. すべての `readonly` / `Readonly<>` / `DeepReadonly<>` 注釈を削除する(デフォルトになったので冗長)。
2. 注釈が「なかった」箇所(= v1 で意図的に可変とした箇所)に `mutable` を付与する。

の両方が純粋に機械的な変換になる。もし v1 で readonly が省略可能だったら、無注釈の型が「readonly のつもりで省略した」のか「可変のつもり」なのか判別できず、codemod が閉じない。**v1 の冗長さは v2 のデフォルト反転のための布石である。**

逆方向(v2 → TS への eject)は transpiler の emit そのもの: `mutable` を剥がし、無注釈箇所に `readonly` を復元する。情報は 1:1 に対応しているため無損失。

## 標準ライブラリとの関係

readonly-by-default は自分のコードだけでは完結しない — `lib.d.ts` の組み込み API が mutable 型を返せば汚染される。この穴を塞ぐのが strict-ts-lib であり、この言語では strict-ts-lib を**組み込みライブラリ層**として仕様に含める([stdlib.md](./stdlib.md))。

## 強制手段

- v1: `functional/prefer-readonly-type` 系ルール(eslint-config-typed で運用中)。

## TS へ戻るときの影響

なし。むしろ readonly が明示された、TS として最も情報量の多い状態が保たれる。

## 未解決の論点

- `DeepReadonly` をどこまで推奨するか(浅い readonly との使い分け基準)。
- ローカル変数の型注釈省略時(推論)に checker がどこまで readonly 性を要求するか。`as const` の強制範囲。
- v2 の `mutable` キーワードの正確な文法(プロパティ修飾子か、型演算子 `mutable T[]` か、両方か)。
