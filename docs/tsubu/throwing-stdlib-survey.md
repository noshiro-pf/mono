# throw しうる標準ライブラリ API の調査

D-22(throw しうる stdlib API を素の形で禁止し、prelude の Result ラッパーへ一択化)の基礎調査。「どれくらいの数があるか」に答える。✔ は Node 26 での実測確認済み。

## 方法論 — 数を桁で減らすフィルタ

ECMAScript 組み込み全体で「throw する可能性がある」関数は膨大だが、**Tsubu の他の規則で到達不能になる throw を除外**すると、対象は「**値依存 throw**」(実行時の値・状態に依存して投げる)だけに絞れる:

- **引数型違反の TypeError**(非関数 comparator、非 iterable への spread 等)→ strict な型付けで静的に排除。ラップ不要。
- **mutation 起因の TypeError**(frozen への代入、`defineProperty` の競合、`setPrototypeOf`、TypedArray の detached 書き込み等)→ immutability 規則([spec/variables-and-mutation.md](./spec/variables-and-mutation.md))で大半が到達不能。
- **既に禁止済みの API** — `eval` / `new Function`(禁止)、`new Array`(禁止)、素の number 系 global(D-21)、`String(symbol)`(D-15 でコンストラクタ静的呼び出し禁止)、空配列 `reduce`(`total-functions/no-partial-array-reduce` + `Arr`)→ 数えない。

## コア ECMAScript の値依存 throw(個別 API)

| API                                                                                 | 例外                                                              | 状態                                                                                                                                                                 |
| :---------------------------------------------------------------------------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `JSON.parse`                                                                        | SyntaxError                                                       | **prelude 対応済み**(`Json.parse` → Result)                                                                                                                          |
| `JSON.stringify`                                                                    | TypeError(BigInt ✔・循環参照)                                     | **対応済み**(`Json.stringify` → Result)                                                                                                                              |
| `new RegExp`                                                                        | SyntaxError(パターン/フラグ)                                      | **ts-data-forge ギャップに登録済み**(動的パターン用の Result ラッパー。リテラル `/…/` は静的検査可能)                                                                |
| `decodeURI` / `decodeURIComponent` / `encodeURI` / `encodeURIComponent`             | URIError(lone surrogate ✔ 等)                                     | 既に `no-restricted-globals` で query-string へ誘導(4 件)                                                                                                            |
| `Date.prototype.toISOString`                                                        | RangeError(Invalid Date)✔                                         | **実装済み(`SafeDate.toISOString` — [#1709](https://github.com/noshiro-pf/mono/pull/1709))**。`toJSON` は throw しない ✔                                             |
| `Number.prototype.toFixed` / `toExponential` / `toPrecision`                        | RangeError(桁数範囲外)✔                                           | **実装済み(`SafeNumber` — [#1725](https://github.com/noshiro-pf/mono/pull/1725))**(3 件)                                                                             |
| `Number.prototype.toString(radix)` / `toLocaleString`                               | RangeError ✔                                                      | `toStringWithRadix` は実装済み([#1725](https://github.com/noshiro-pf/mono/pull/1725))。`toLocaleString` は Tier 2                                                    |
| `BigInt()`                                                                          | RangeError(非整数 ✔)/ SyntaxError                                 | 要ラップ                                                                                                                                                             |
| `BigInt.prototype.toString(radix)` / `toLocaleString` / `BigInt.asIntN` / `asUintN` | RangeError                                                        | 要ラップ(4 件)                                                                                                                                                       |
| `String.fromCodePoint` ✔ / `String.prototype.normalize` ✔ / `repeat` ✔              | RangeError                                                        | **実装済み(`SafeString` — [#1725](https://github.com/noshiro-pf/mono/pull/1725))**(3 件)                                                                             |
| `String.prototype.localeCompare` / `toLocaleLowerCase` / `toLocaleUpperCase`        | RangeError(構文不正なロケールタグのみ。未知タグは throw しない ✔) | 要検討(3 件 — タグをリテラル/検証済み型に限れば静的化可能)                                                                                                           |
| `Array.prototype.with`                                                              | RangeError(範囲外 index)✔                                         | **`Arr.set` として提供済み**。tuple では型(`ArgArrayIndex`)が範囲外を静的に防ぐが、**可変長配列では `.with` の RangeError が残る**(Optional/Result 版の要否は残論点) |
| `Iterator.prototype.take` / `drop`                                                  | RangeError(負値 ✔)                                                | 要ラップ(2 件)                                                                                                                                                       |
| `structuredClone`                                                                   | DOMException(DataCloneError)✔                                     | 要ラップ                                                                                                                                                             |

**小計: 約 26 API。うち対応済み・禁止済み・誘導済みが約 9。実質の新規ラップ対象は約 17。**

## family 枠(モジュール単位でまとめてラップできる群)

| family                                        | 値依存 throw の面                                                                                                                                                                                   | 概数         |
| :-------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------- |
| TypedArray / DataView / ArrayBuffer / Atomics | コンストラクタ(長さ・offset・alignment の RangeError)×14、`DataView` の get/set 系(境界外 RangeError ✔)×16、`TypedArray.prototype.set` / `with`、`ArrayBuffer.resize` / `transfer`、`Atomics.*` ×12 | **約 45–50** |
| Intl                                          | 全コンストラクタ(不正ロケール/オプションの RangeError ✔)×10 + `format` 系の Invalid Date ✔ 等                                                                                                       | **約 15–20** |
| Temporal(Node 26 に存在 ✔)                    | 値依存 throw が設計の一部(`from` / `with` / 算術 overflow が RangeError)。**サポート決定(D-23)— 要ラップ family**                                                                                   | **数十**     |

## 集計と評価

- **日常頻出の要ラップは 20 弱**(コアの新規 17 + RegExp/Date 周辺の頻度が高い)。
- **全網羅でも family 込みで 100 前後**(Temporal 除く)。多いが有限で、family はバイナリ境界(TypedArray 系)・国際化境界(Intl)に局在するため、**境界モジュール単位で一括ラップ**できる。
- 型システム・immutability・既存禁止による除外フィルタが効いており、「stdlib 全部」を恐れる規模ではない。

## エラー payload の設計(D-26)

ラッパーの失敗は **検証ファーストの plain tagged union** で返す([decisions.md](./decisions.md) D-26)。仕様が固定するのは throw の条件でありメッセージではないため、catch 後の Error 分類はエンジン依存になる — 仕様条件をラッパー自身が事前検査し(強制変換・判定順序まで鏡写し)、関数ごとの kind で返す。実装依存の残余(`repeat` の最大文字列長超過など)は `fromThrowable` backstop で `{ kind: 'unexpected', cause }` に写し、唯一の失敗が引数型で排除される API(`normalize` の form union)は Result を返さず全域関数にする。生 API との同値スイープテストで throw ↔ Err の一致を固定している。

## 実装優先順位(提案)

1. **Tier 1(頻出・小粒)**: `RegExp` 生成、`Date.toISOString`、`Number.toFixed` / `toExponential` / `toPrecision` / `toString(radix)`、`String.fromCodePoint` / `normalize` / `repeat`、`Array.with`(Json は済)。
2. **Tier 2**: `BigInt` 系、`Iterator.take/drop`、`structuredClone`、`toLocaleString` 系。
3. **Tier 3(family)**: TypedArray/DataView/Atomics 境界モジュール、Intl 境界モジュール。
4. **Temporal**: 導入判断とセットで別途。

## 次の調査枠(この調査のスコープ外)

- **番兵値で失敗を返す API**(`indexOf` の -1、`parseInt` の NaN、`match` の null 等)— throw はしないが「失敗の型化」対象としては同じ原則(D-22 の一般化)が適用できる。`Num.safeParseInt` / `Arr.find`(Optional 返し)等で一部対応済み。別途棚卸しする。
- DOM / Node API の throw(`atob`、`URL` コンストラクタ、fs 系…)— 環境プロファイル([spec/compiler-options.md](./spec/compiler-options.md) の lib 節)とセットで。
