# @sumi-lang/conformance

TypeScript サブセット言語(Sumi)の**エンジン非依存の適合性コーパス**。形式定義・設計判断は
[languages/sumi/docs/conformance-corpus.md](../docs/conformance-corpus.md) と
[languages/sumi/docs/implementation-plan.md](../docs/implementation-plan.md)(Phase 0 / 1)を参照。

- `fixtures/<spec-area>/<rule-id>/{valid,invalid}/*.mts` — フィクスチャ。期待診断は `// @sumi-expect-error <rule-id>` マーカーで表す。**Prettier から除外されており(ルート `.prettierignore`)、byte-for-byte で保存される。** リポジトリ自身の lint / tsc の対象でもない(意図的な違反コードを含むため)。`fixtures/tsconfig.json` は type-aware エンジンがフィクスチャを型検査するときの compilerOptions で、Sumi の base tsconfig の draft(D-40)そのもの。
- `src/` — マーカーのパーサとフィクスチャ走査。
- `test/validate-fixtures.test.mts` — Phase 0 の構造検証(マーカー構文・ディレクトリ構造・ルール ID の妥当性)。
- `test/oxlint-engine.test.mts` — Phase 1 のエンジン実行。[@sumi-lang/oxlint-config](../oxlint-config) の preset で全フィクスチャを 1 プロセスで lint し、診断を中立 ID に正規化してマーカーと**完全一致**で照合する(過不足ともエラー)。preset の JS plugin は `dist/` から読まれるので、実行前に `pnpm --filter @sumi-lang/oxlint-config run build` が必要(CI は `ws:build` 後に `ws:test` を走らせる)。

このパッケージは publish しない(`private: true`)。
