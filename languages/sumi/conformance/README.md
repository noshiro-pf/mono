# @sumi-lang/conformance

TypeScript サブセット言語(Sumi)の**エンジン非依存の適合性コーパス**。形式定義・設計判断は
[languages/sumi/docs/conformance-corpus.md](../docs/conformance-corpus.md) と
[languages/sumi/docs/implementation-plan.md](../docs/implementation-plan.md)(Phase 0 / 1)を参照。

- `fixtures/<spec-area>/<rule-id>/{valid,invalid}/*.mts` — フィクスチャ。期待診断は `// @sumi-expect-error <rule-id>` マーカーで表す。**Prettier から除外されており(ルート `.prettierignore`)、byte-for-byte で保存される。** リポジトリ自身の lint / tsc の対象でもない(意図的な違反コードを含むため)。`fixtures/tsconfig.json` は type-aware エンジンがフィクスチャを型検査するときの compilerOptions で、Sumi の base tsconfig の draft(D-40)そのもの。
- `src/` — マーカーのパーサとフィクスチャ走査。
- `test/validate-fixtures.test.mts` — Phase 0 の構造検証(マーカー構文・ディレクトリ構造・ルール ID の妥当性)。
- `test/engine.test.mts` — Phase 1 のエンジン実行。[@sumi-lang/oxlint-config](../oxlint-config) の preset、[@sumi-lang/checker](../checker)、native tsc(`fixtures/tsconfig.json`、診断は `compiler/<code>`)をそれぞれ全フィクスチャに対して 1 回ずつ走らせ、診断を中立 ID に正規化して合わせたものをマーカーと**完全一致**で照合する(過不足ともエラー)。したがって invalid フィクスチャはコンパイラエラーも `compiler/<code>` で表し、valid フィクスチャは型エラー 0 件でなければならない。preset の JS plugin は `dist/` から読まれるので、実行前に `pnpm --filter @sumi-lang/oxlint-config run build` が必要(CI は `ws:build` 後に `ws:check:test:cov` を走らせる)。
- `test/eslint-bridge.test.mts` — ブリッジ([@sumi-lang/eslint-config](../eslint-config))の同値性ゲート。ESLint 版 preset(`configs/eslint-bridge.config.mts`)で全フィクスチャを lint し、[@sumi-lang/cli](../cli) の `eslintRulesByRuleId` で中立 ID に引けた診断だけをマーカーと照合する。主エンジンと食い違うフィクスチャは `knownDivergences` に理由付きで列挙し、一致するようになったら外さないと失敗する。

このパッケージは publish しない(`private: true`)。
