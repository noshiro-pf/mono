<!-- cspell:ignore bivariance -->

# 禁止構文カタログ

TS の構文のうちこの言語が持たないもの。「TS 全機能の網羅表」は今後このファイルを拡張して作る(未着手領域は [README.md](../README.md) 参照)。

## 確定(ユーザー要件として明示されたもの)

| 構文                  | 代替                               | 理由                                                                |
| :-------------------- | :--------------------------------- | :------------------------------------------------------------------ |
| `var`                 | `const` / `let mut_*`              | 関数スコープ・hoisting は歴史的遺物                                 |
| `==` / `!=`           | `===` / `!==`                      | 暗黙の型変換                                                        |
| `enum` / `const enum` | union 型 + `as const` オブジェクト | 消去不能構文・数値 enum の不健全性(erasableSyntaxOnly にも含まれる) |

## 確定(D-4: erasableSyntaxOnly 包含)

| 構文                                     | 代替                   |
| :--------------------------------------- | :--------------------- |
| 実行時 `namespace` / `module`            | ESM モジュール         |
| class parameter properties               | 明示的なフィールド宣言 |
| `import foo = require(...)` / `export =` | ESM import/export      |

## 確定(2026-09-05 採用 — 既存 eslint-config-typed の運用を仕様へ昇格、D-27)

| 構文                                                                                 | 代替                                       | 理由                                                    |
| :----------------------------------------------------------------------------------- | :----------------------------------------- | :------------------------------------------------------ |
| `as any` / `as never` / `@ts-ignore`                                                 | 型ガード / `@ts-expect-error`(最終手段)    | 型システムの穴                                          |
| `in` 演算子(narrowing 用途)                                                          | `isRecord` + `hasKey`                      | prototype chain を見る・narrowing が不正確              |
| `+foo` / `"" + foo`(暗黙変換 idiom)                                                  | `Number()` / `String()` / template literal | 暗黙変換                                                |
| 異型の `+`(`"1" + 2`)                                                                | template literal                           | 暗黙変換                                                |
| 文字列連結の `+`                                                                     | template literal / `.join()`               | 可読性・型安全                                          |
| `new Array()`                                                                        | 配列リテラル / `Arr.*`                     | 引数 1 個の挙動が罠                                     |
| `eval` / `new Function`                                                              | —                                          | セキュリティ・静的解析不能                              |
| 比較関数なしの `sort()`(string[] 以外)                                               | 比較関数必須                               | デフォルトの文字列比較ソートは罠                        |
| 部分関数的な生の除算                                                                 | `Num.div` + 非ゼロ検査                     | 0 除算                                                  |
| `with`                                                                               | —                                          | strict mode で既に禁止                                  |
| default export(`export default` / `export { x as default }`、設定ファイルも含め全面) | named export                               | [modules.md](./modules.md)(D-28。ツールへの接続は D-36) |

## 確定(2026-08-27 採用)

以下はすべて採用(禁止)とする。暗黙変換系は基本的にすべて禁止する方針。明確にユーザビリティが下がるケースがないかは運用しながら確認し、見つかれば個別に再検討する。(generator の禁止は当初ここにあったが **D-18 で撤回** — [functions.md](./functions.md)。)

| 構文                                                 | 代替                           | 論点                                                                                                                                                                 |
| :--------------------------------------------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ラベル文 / `continue label`                          | 関数分割                       | ほぼ goto                                                                                                                                                            |
| カンマ演算子                                         | 文に分ける                     | 可読性                                                                                                                                                               |
| `void` 演算子                                        | —                              | `undefined` を直接書けばよい                                                                                                                                         |
| `++` / `--`                                          | `+= 1`                         | 式としての値(前置/後置)が罠。for カウンタは `range` + `for..of` が基本、例外は `let mut` カウンタ + `+= 1`([variables-and-mutation.md](./variables-and-mutation.md)) |
| sparse array literal(`[1, , 3]`)                     | —                              | hole は undefined と別物という罠                                                                                                                                     |
| `delete`                                             | spread による除外 / `Obj.*`    | mutation かつ hidden class 破壊                                                                                                                                      |
| デコレータ                                           | 高階関数                       | 仕様が長年不安定だった。禁止                                                                                                                                         |
| `function` 式 / オーバーロードなしの `function` 宣言 | arrow function                 | arrow に統一。`function` 宣言は**オーバーロードシグネチャを伴う場合のみ**許可(D-13 — [functions.md](./functions.md)。条件付き許可はチェッカー新規実装)               |
| `arguments`                                          | rest パラメータ                | 遺物                                                                                                                                                                 |
| bitwise 演算子                                       | v1 では全面禁止                | 32bit 整数への暗黙変換が罠。>=v2 で `Int32` 等の数値型分類を導入した上で厳密化して再導入([future-syntax.md](./future-syntax.md) 候補 7)                              |
| メソッド短縮記法(型・実装とも)                       | プロパティ形式の関数型 / arrow | **bivariance の温床**。[classes.md](./classes.md) 参照                                                                                                               |
| `throw`(全面禁止)                                    | `Result` + `fromThrowable`     | エラーは `Result` に統一([exceptions.md](./exceptions.md))。`try..catch` も禁止(確定 2026-09-05 — D-27)                                                              |

## 確定(2026-08-29 採用)

| 構文                                                                                         | 代替                                                             | 理由                                                                                                                                                |
| :------------------------------------------------------------------------------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| class 宣言・class 式・`extends`                                                              | closure factory + 構造的 interface + tagged union                | **class 全面禁止**(D-12 — [classes.md](./classes.md)。synstate 実験 [#1703](https://github.com/noshiro-pf/mono/pull/1703) で置き換えの汎用性を確認) |
| `this`(全面)                                                                                 | closure 変数                                                     | class 禁止に伴い出現余地が消滅(D-12)                                                                                                                |
| コンストラクタの静的呼び出し(`Boolean(x)` / `Number(x)` / `String(x)` / `Array(x)` 等)       | ts-data-forge の生成関数(D-15 TODO)                              | 暗黙変換の関数形。意図(パース/変換/判定)が名前に現れず、失敗も型に現れない                                                                          |
| angle-bracket 型アサーション(`<T>x`)                                                         | `as`(unsafe なものはそもそも禁止)                                | v2 の単一拡張子(D-11 — [jsx.md](./jsx.md))の前提として文法から除去                                                                                  |
| 宣言名としての識別子 `fn`                                                                    | 別名(`fnValue` 等)                                               | v2 の関数宣言キーワードとして予約(D-17 — [functions.md](./functions.md)。プロパティ名は対象外)                                                      |
| global 定義名の shadow(`undefined` / `NaN` / `Array` / `JSON` / global 型名 等)              | 別名                                                             | すべて予約語扱い(D-19 — [variables-and-mutation.md](./variables-and-mutation.md)。`let undefined = 1` が合法という JS の穴を塞ぐ)                   |
| 素の number 系 global(`NaN` / `Infinity` / `parseInt` / `parseFloat` / `isNaN` / `isFinite`) | `Number.NaN` / `Number.POSITIVE_INFINITY` / `Number.parseInt` 等 | 参照すべき定義の一択化(D-21)。global の `isNaN`/`isFinite` は暗黙変換する別物でもある                                                               |

### `|`/`&` と `||`/`&&` の書き間違いについて

書き間違いは型で両方向とも検出できる:

- boolean オペランドへの `|` / `&` は TS 自体が既にエラーにする(TS2447: `The '|' operator is not allowed for boolean types. Consider using '||' instead.` 系)。
- number オペランドへの `||` / `&&` は本言語の boolean 厳密化([booleans-and-logic.md](./booleans-and-logic.md))が拒否する。

v1 では bitwise 演算子自体が禁止なのでこの混同は起こり得ないが、v2 で `Int32` とともに再導入する際の設計条件(結果型が boolean / number のどちらかで判定できること)として記録しておく。

## 確定(2026-09-05 採用)

| 構文                            | 代替                                               | 理由                                                                                                                      |
| :------------------------------ | :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| getter / setter(object literal) | 明示的な関数プロパティ(`x: () => …`)/ memoize      | プロパティアクセスが関数呼び出しになる暗黙の制御フロー。setter は mutation。class 文脈は D-12 で消滅済み(D-33 — 両方禁止) |
| `using` / `await using`         | `fromThrowable` に渡すコールバック内で明示的に解放 | v1 では禁止、採否は v2 で再検討(D-30)                                                                                     |

論理代入演算子 `&&=` / `||=` / `??=` は禁止**しない**(`mut_` 変数に限り 3 つとも許可 — D-29、[booleans-and-logic.md](./booleans-and-logic.md))。

## 強制手段

いずれも ESLint(`no-restricted-syntax` を含む)+ tsc オプションで v1 実装可能。大半は eslint-config-typed に既存ルールがある。

## TS へ戻るときの影響

なし(すべて「書かない」制限であり、書かれたコードは合法 TS)。
