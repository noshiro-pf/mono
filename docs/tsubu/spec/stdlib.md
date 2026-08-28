<!-- cspell:ignore neverthrow bimap -->

# 標準ライブラリ(strict-lib + ts-data-forge prelude)

## 二層構造(D-6)

1. **組み込み層** — `lib.d.ts` 相当。strict-ts-lib を採用し、readonly 化・危険 API の型レベル封印を組み込みの前提とする([readonly.md](./readonly.md)、[compiler-options.md](./compiler-options.md))。
2. **prelude 層** — 言語ネイティブに見せたいユーティリティ: `pipe`、`match`、`Optional`、`Result`、`Arr`、`Num` など。実体は ts-data-forge。

### prelude の見せ方

目標: `Optional` / `Result` / `pipe` / `match` を、import 文なしでネイティブ言語機能のように使えること。

- **型**は v1 から global にできる(ts-type-forge が `global.d.mts` でやっている方式)。
- **実行時の値**は v1 では明示 import が必要。`globalThis` への注入は「アプリの entry point が先に実行される」ことに依存し、ライブラリでは成立しないため採らない。
- **v2**: transpiler が prelude 識別子の使用を検出し、emit する TS に `import { Optional } from 'ts-data-forge';` を自動挿入する。eject 後のコードは明示 import 付きの普通の TS になる(D-3 の「機械的移行」が import 挿入という形で成立)。

## Optional / Result の現状 API(2026-08-27 調査)

ts-data-forge の現状(すべて直接形 + カリー化形の二本立て):

- `Optional`: `some` / `none` / `fromNullable` / `toNullable` / `isSome` / `isNone` / `isOptional` / `map` / `flatMap` / `filter` / `orElse` / `zip`(2 引数のみ)/ `unwrap` / `unwrapOr` / `unwrapThrow` / `expectToBe`
- `Result`: `ok` / `err` / `fromPromise` / `fromThrowable` / `toOptional` / `swap` / `isOk` / `isErr` / `isResult` / `map` / `mapErr` / `flatMap` / `fold`(注: bimap であり Result を返す。値への畳み込みではない)/ `orElse` / `zip`(2 引数のみ)/ `unwrapOk` / `unwrapErr` / `unwrapOkOr` / `unwrapErrOr` / `unwrapThrow` / `unwrapErrThrow` / `expectToBe`
- 第三の ADT として `TernaryResult<S, W, E>`(`Ok | Warn | Err`)が並行 API で存在。
- `pipe(x)` は fluent ラッパー(`.map` / `.mapNullable` / `.mapOptional`(Optional のときのみ)/ `.value`)。`.mapResult` は無い。
- `match(target, cases)` は文字列リテラル union のテーブル引きであり、ADT の構造的マッチャーではない。
- `Optional` 生産者: `Arr.at/head/last/find/findLast/min/max/minBy/maxBy`、`IMap.get`、`Queue.dequeue`、`Stack.pop`。`Result` 生産者: `Json.parse/stringify`、`Num.safeParseInt/safeParseFloat`、`Arr.join`、`createPromise`。

## ギャップ分析: 他言語(Rust / neverthrow / fp-ts)比較で欠けているもの

優先度: ★★★ = 言語の一次エラーハンドリング手段として日常的に必要 / ★★ = ないと定番パターンが書けない / ★ = あると良い。

**実装状況(2026-08-28)**: ★★★ のうち `Optional.match` / `Result.match` / `Optional.toResult` 相当 / `safeTry` は
[#1702](https://github.com/noshiro-pf/mono/pull/1702) で実装済み。

- `Optional.toResult` は **`Result.fromOptional`** として実装した(optional → result 方向の import は既存の `Result.toOptional` と合わせて循環 import になるため。`Result.toOptional` との命名対称性も得られる)。
- `safeTry` は `yield* Result.safeUnwrap(r)` で unwrap する neverthrow 方式。`async function*` を渡すと `Promise<Result>` が返り body 内で `await` が使えるため、async 合成の一部はこれで書ける。
- **`ResultAsync`(`Promise<Result>` を透過する `map`/`flatMap` 群)は未実装のまま残る唯一の ★★★**。
- 実装から得た v2 構文設計への知見: `Generator<Err<E1>, Result<S, E2>>` 型の union → union 推論(`Ok<number> | Err<'e2'>` を `Ok<S> | Err<E2>` に当てる)は TS が候補を出せず破綻するため、`UnwrapOk`/`UnwrapErr` による全体推論形が必要だった。`?` 構文の emit を safeTry 包みで行う場合([future-syntax.md](./future-syntax.md) 候補 4)も同じ制約を受ける。

### Optional

| 欠けている機能                  | 他言語での対応物                 | 優先度 | 備考                                                                                       |
| :------------------------------ | :------------------------------- | :----- | :----------------------------------------------------------------------------------------- |
| `match` / 値への畳み込み        | Rust `map_or_else`、fp-ts `fold` | ★★★    | `Optional.match(o, { some: (v) => ..., none: () => ... })`。パターンマッチ構文(v2)の関数版 |
| `toResult`(err 値を与えて変換)  | Rust `ok_or` / `ok_or_else`      | ★★★    | `Result.toOptional` の逆向きが無い                                                         |
| `sequence` / `traverse`         | Rust `collect::<Option<Vec<_>>>` | ★★     | `readonly Optional<T>[]` → `Optional<readonly T[]>`。`Arr` 側との連携                      |
| 遅延デフォルト `unwrapOrElse`   | Rust `unwrap_or_else`            | ★★     | `unwrapOr` は eager のみ                                                                   |
| 遅延 `orElse`(thunk を取る)     | Rust `or_else`                   | ★★     | 現状の `orElse` は評価済みの代替値を取る                                                   |
| n-ary `zip` / `zipWith`         | —                                | ★      | 現状 2 引数のみ                                                                            |
| `flatten`                       | Rust `flatten`                   | ★      | `Optional<Optional<T>>` → `Optional<T>`(`flatMap(id)` で代用可)                            |
| `tap` / `inspect`               | Rust `inspect`                   | ★      | デバッグ・副作用の明示点                                                                   |
| 述語系 `isSomeAnd` / `contains` | Rust `is_some_and`               | ★      |                                                                                            |
| type guard 版 `filter`          | —                                | ★      | `filter` に narrowing オーバーロードが無い                                                 |

### Result

| 欠けている機能                             | 他言語での対応物                                            | 優先度 | 備考                                                                                                                                            |
| :----------------------------------------- | :---------------------------------------------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| **早期 return 伝播(`?` 相当)**             | Rust `?`、neverthrow `safeTry`(generator 利用)              | ★★★    | これが無いと `flatMap` の入れ子地獄になる。v1 は generator ベースの `safeTry` 相当で橋渡し、v2 で構文化([future-syntax.md](./future-syntax.md)) |
| `match` / 値への畳み込み                   | Rust `map_or_else`、neverthrow `match`                      | ★★★    | 現状の `fold` は bimap(Result → Result)で、名前が他言語の fold(→ 値)と衝突している点も要整理                                                    |
| **async 系(`ResultAsync`)**                | neverthrow `ResultAsync`(`map`/`andThen` が Promise を透過) | ★★★    | `Promise<Result<S, E>>` に対する `map`/`flatMap`/`fromPromise` の合成。現状は都度 await して分解するしかない                                    |
| `fromPromise` のエラー型指定               | neverthrow `fromPromise(p, errFn)`                          | ★★     | 現状 `Result<T, unknown>` 固定。`errFn: (u: unknown) => E` を渡せるべき                                                                         |
| `fromThrowable` のエラー変換・引数付き関数 | neverthrow `fromThrowable(fn, errFn)`                       | ★★     | 現状 thunk 限定・エラーは `Error` 固定                                                                                                          |
| `sequence` / `combine`                     | neverthrow `combine`                                        | ★★     | `readonly Result<S, E>[]` → `Result<readonly S[], E>`                                                                                           |
| **エラー蓄積版 `combineWithAllErrors`**    | neverthrow 同名、fp-ts `Validation`                         | ★★     | フォーム検証等で「最初のエラーで打ち切らず全部集める」。Applicative 的合成                                                                      |
| 遅延 `orElse`(エラー値から回復関数)        | Rust `or_else`                                              | ★★     | 回復処理がエラー値を見られない                                                                                                                  |
| `unwrapOkOrElse` 等の遅延デフォルト        | Rust `unwrap_or_else`                                       | ★★     |                                                                                                                                                 |
| `transpose`                                | Rust `transpose`                                            | ★      | `Optional<Result<T, E>>` ↔ `Result<Optional<T>, E>`                                                                                             |
| `tap` / `tapErr`                           | Rust `inspect` / `inspect_err`                              | ★      | ログ挿入の定番                                                                                                                                  |
| `flatten`、n-ary `zip`                     | Rust `flatten`                                              | ★      |                                                                                                                                                 |
| `Arr.partitionResults`                     | Rust `partition`                                            | ★      | `readonly Result<S, E>[]` → `[readonly S[], readonly E[]]`                                                                                      |

### 横断的な論点

- **`pipe` との統合**: `Pipe` に `mapResult` / `flatMapOptional` / `flatMapResult` が無く、Optional 系だけ特別扱いになっている。prelude として一貫させるなら演算子相当の網羅が要る(ただし v2 でパイプ演算子が入るなら fluent ラッパーは過渡的手段)。
- **`match` の二重意味**: 現状の `match`(文字列テーブル引き)と、将来のパターンマッチ(構造的)は別物。名前の衝突を今のうちに設計しておく(現 `match` を `matchTag` 等へ改名するか、構造マッチャーが `match` を継承拡張するか)。
- **`T | undefined` と `Optional<T>` の使い分け指針**が未規定。Rust には「`null` が無いのですべて `Option`」という一貫性があるが、この言語では `undefined` が生き残る([null-undefined.md](./null-undefined.md))ため、「境界・単発は `?? undefined`、合成が続くなら `Optional`」のような規範を言語として明文化する必要がある。`exactOptionalPropertyTypes` 下でのプロパティ表現も含む。

## TS へ戻るときの影響

なし(v1 は明示 import の普通のライブラリ利用。v2 の auto-import も eject 時に import 文として実体化される)。

## 未解決の論点

- **コンストラクタ静的呼び出しの代替生成関数**(D-15)と **throw する stdlib の Result ラッパー**(D-22 — 対象は [throwing-stdlib-survey.md](../throwing-stdlib-survey.md)): `Num.safeParseInt` 系・`Json.*` が既存モデル。**`new RegExp` の Result ラッパー(動的パターン用)をギャップに追加**(2026-08-29)。`Arr.set` の可変長配列での範囲外(RangeError が残る)への Optional/Result 版も検討対象。
- **null / 番兵値を返す API の Optional ラップ(方針)**: throwable → Result と対になる形で、null を返す API(`RegExp.prototype.exec`、`match` 等)は Optional を返すラッパーへ寄せたい(ユーザー意向 2026-08-29。番兵値 API の棚卸しは survey の次の調査枠)。
- **ラッパー群のパッケージ構成(確定 — D-24)**: 一方向依存の新ライブラリ **ts-std-forge**(仮名)を採用。scaffold は [#1709](https://github.com/noshiro-pf/mono/pull/1709)。以下は検討の記録:懸念は相互依存 — ts-data-forge は基本 ADT(Result/Optional/pipe)と拡張 `Arr` の両方を持つため、分割すると双方向依存になりうる。**整理案(提案)**: 依存を「wrapper 新 lib → ts-data-forge」の一方向に固定する。ts-data-forge が wrapper を必要とする状況は「自身の実装内部では素の stdlib を直接使ってよい(境界の実装者)」と定義すれば発生しない。歴史的に ts-data-forge にある `Json.*` / `Num.safeParse*` は当面そのままにし、新 lib が re-export で facade になる(実体移動は将来の major で)。より根本的な代替は「ADT コア(Result/Optional/pipe のみ)の最小パッケージを切り出し、ts-data-forge と wrapper lib が共にそれへ依存する」形(fp-ts/effect 型の kernel 構成)だが、公開済みパッケージの再編コストが大きい。
- prelude の範囲(`Arr` / `Num` / `Obj` / `IMap` 等をどこまで「言語機能」扱いにするか)。
- 上記ギャップを ts-data-forge 本体に実装する順序(★★★ の 4 件: `Optional.match` / `Optional.toResult` / `Result.match` / `safeTry` + async 系、が先頭候補)。
- `TernaryResult` を言語仕様に含めるか。
