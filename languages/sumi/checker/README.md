<!-- cspell:ignore rslint -->

# @sumi-lang/checker

Sumi の**型情報が要るルール**を走らせるチェッカー。TypeScript 7 が同梱する
JS API(`typescript-native/unstable/*`)の上に直接乗っており、1 プロジェクト
= 1 プログラム = 1 パスで全ルールを回す(D-54)。

構文だけで決まるルールは [@sumi-lang/oxlint-config](../oxlint-config) の
oxlint preset 側にある。どちらのエンジンが出した診断かは中立ルール ID
([conformance/src/rule-ids.mts](../conformance/src/rule-ids.mts))に正規化され、
適合性コーパスは両者を混ぜて 1 つの多重集合として比較する。

## なぜ既存の linter でないのか

**速いネイティブ linter はどれも型情報付きのカスタムルールを書けない**(2026-09
調査)。oxlint の JS plugin はドキュメントが型情報を明示的に未対応とし、rslint は
plugin から `parserServices` が取れず、Biome の GritQL は型に触れない。fork すれば
ルールは Go になり、既存の構文ルールとも統合されない。

一方 TypeScript 7 は `Project` に `program` と `checker` を持つ JS API を同梱して
おり、`checker.getTypeAtLocation(node)` がそのまま呼べる。`sumi check` は既に
同じ `typescript-native` で型検査しているので、**依存は増えず、lint と型検査が同じ
コンパイラ・同じバージョン・同じ tsconfig を見る**。

## 速度(synstate 76 ファイル、実測)

| 段階                                        |   時間 |
| :------------------------------------------ | -----: |
| プロジェクトを開いて program を得る         |  66 ms |
| 全ファイルの構文走査                        |  18 ms |
| 宣言名 804 個への `getTypeAtLocation`(cold) | 164 ms |
| union を辿って判定                          |  11 ms |
| 合計                                        | 262 ms |

## ルールの書き方

```ts
import { type Rule } from '@sumi-lang/checker';

export const myRule: Rule = {
    ruleId: 'area/rule-name', // 中立ルール ID
    description: '...',
    visit: (node, { checker, report }) => {
        // 構文で候補を絞ってから型を聞く。
        if (!isSomething(node)) return;

        const type = checker.getTypeAtLocation(node);

        if (type !== undefined && isBad(type)) report(node, 'why');
    },
};
```

`src/all-rules.mts` に加えれば有効になる。

**`checker` は RPC 越し**であることに注意。`Type` はハンドルで、`getTypes()` の
ような呼び出しは往復になる。走査は全ノードを訪れるので、**構文で候補を絞ってから
型を聞く**こと。全ノードに型を聞けばプログラム全体の型付けを払うことになる。

## 注意

API 名が `unstable/*` である以上、TypeScript のマイナー更新で壊れうる。この
リポジトリは `typescript-native` を 7.0.2 にピン止めしているので、更新は自分の
タイミングで受け止められる。
