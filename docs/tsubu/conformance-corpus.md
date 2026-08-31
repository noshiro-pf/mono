# 適合性コーパスの設計(Phase 0)

エンジン非依存の言語適合性テスト資産の形式定義。[implementation-plan.md](./implementation-plan.md) Phase 0 の成果物で、Phase 1(ESLint preset)・Phase 2(専用チェッカー)・v3 が**同じフィクスチャ**で検証される。エンジン乗り換え時の同値性ゲートを兼ねる。

## 設計原則

1. **フィクスチャはエンジンに依存しない。** 期待する診断は ESLint のルール名ではなく、この言語の**中立ルール ID**(後述)で書く。エンジンごとの対応(中立 ID → ESLint ルール名 / tsc エラーコード / 将来のチェッカー診断コード)は runner 側のマッピング 1 箇所に集約し、[enforcement-map.md](./enforcement-map.md) と同期させる。
2. **期待診断は行アンカーのインラインマーカーで書く**(sidecar の JSON に行番号を書く方式は編集で番号がずれるため不採用)。
3. **1 フィクスチャ 1 論点。** 検査対象のルール以外の違反を含めない(valid 側は素の言語で合法、invalid 側はマーカーの診断**だけ**が出ることを runner が検証する — 余計な診断もエラー)。
4. フィクスチャは自己完結したモジュール。prelude(ts-data-forge)からの import は可。

## ディレクトリ構造

```text
fixtures/
  <spec-area>/            spec ファイル名に対応(banned-syntax, mutation, readonly, null, boolean, modules, functions, exceptions, classes, jsx, compiler)
    <rule-id>/            中立ルール ID の末尾セグメント
      valid/*.mts         診断ゼロであるべきコード
      invalid/*.mts       マーカーどおりの診断が出るべきコード
```

## 中立ルール ID

`<spec-area>/<rule>` の形式。例:

- `banned-syntax/no-var`、`banned-syntax/no-loose-equality`、`banned-syntax/no-enum`
- `mutation/no-let-without-mut-prefix`、`mutation/no-mutation-without-mut-prefix`
- `readonly/require-readonly-parameter`、`readonly/require-readonly-type-declaration`
- `null/no-null-literal`、`null/no-null-in-declaration`
- `boolean/strict-logical-operands`、`boolean/no-expression-statement-logical`
- `modules/require-extension`、`modules/no-default-export`
- `compiler/<tsc エラーコード>`(compilerOptions 固定に由来する診断は tsc コードをそのまま名前空間 `compiler/` で参照: 例 `compiler/2532`)

ID の一覧と各エンジンへの対応は runner のマッピングファイルが単一の真実になる(enforcement-map.md はその文書ビュー)。

## 期待診断マーカー

```ts
// @tsubu-expect banned-syntax/no-var
var x = 1;

// 同一行に複数の診断が出る場合はマーカーを重ねる
// @tsubu-expect banned-syntax/no-loose-equality
// @tsubu-expect boolean/strict-logical-operands
const b = a == c && n;
```

- マーカーは**直後の 1 行**に適用される。
- オプションでメッセージ部分文字列を検証できる: `// @tsubu-expect null/no-null-literal "use undefined"`
- ファイル全体に対する診断(モジュール形式の違反など)は先頭の `// @tsubu-expect-file <rule-id>` で表す。
- `valid/` 配下のファイルはマーカーを含んではならない(runner が検証)。

## runner の契約(Phase 1 で実装)

1 つの fixture ファイルに対し、対象エンジン(Phase 1: 固定 compilerOptions の tsc + subset ESLint preset / Phase 2: 専用チェッカー)を実行し:

- 出た診断の集合を中立 ID へ正規化し、マーカーの集合と**完全一致**することを検査する(過不足ともエラー)。
- `valid/` は診断ゼロ。
- マーカー構文の整合(未知のルール ID、`valid/` 内のマーカー等)自体も検査する。

複数エンジンが有効な期間(ESLint → 専用チェッカーの移行中)は、**両エンジンで同じ結果になること**を CI で検証する — これが移植の同値性ゲート。

## 収集の優先順位

1. 仕様の `確定` 項目のうち enforcement-map で ✅/🔧/⏻ のもの(既存ルールの挙動を仕様として固定する意味がある)。
2. 🆕(新規実装)項目 — 実装前にフィクスチャを書くこと自体が仕様の曖昧さ検出になる(TDD)。
3. `提案`/`未定` 項目はフィクスチャを書かない(仕様確定を待つ)。

整備状況の単一の真実は `languages/tsubu/conformance/src/rule-ids.mts`(登録された中立 ID = フィクスチャ整備済みルール)。enforcement-map への列追加は表の churn が大きいため採らない。

## 運用上の注意

- **fixture はリポジトリ全体の品質ゲートから除外が必要**: invalid フィクスチャは意図的に違反コードを含むため、リポジトリ自身の ESLint / tsc の対象にしてはならない。**Prettier からも除外する必要がある**(例: `<T,>` のフィクスチャをフォーマッタが書き換えると検査対象が消える。Prettier の ignore はルートの `.prettierignore` のみ有効 — CLAUDE.md 参照)。cspell はディレクティブで個別対応可。
- 置き場所は CI diff ゲートとの相互作用がある: ルート `docs/` と `**.md` は code-checks ゲートの ignore 対象のため、**docs 配下に置くとフィクスチャ変更で型チェック系 CI が走らない**。runner と同じワークスペースメンバー内に置くのが安全(→ 置き場所の決定は未確定、下記)。

## 確定事項(2026-08-28)

- **置き場所**: 言語開発用トップレベル `languages/` 配下の `languages/tsubu/conformance/`(D-8 改訂。仮名、言語名決定後にリネーム)。ワークスペースメンバー。実体は [#1707](https://github.com/noshiro-pf/mono/pull/1707)。
- **fixtures はルート `.prettierignore` で除外**し byte-for-byte 保存(D-9)。
- **Phase 1 の subset preset は独立パッケージ**(D-10)。
