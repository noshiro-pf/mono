# tsubu-conformance

TypeScript サブセット言語(Tsubu)の**エンジン非依存の適合性コーパス**。形式定義・設計判断は
[docs/tsubu/conformance-corpus.md](../../../docs/tsubu/conformance-corpus.md) と
[docs/tsubu/implementation-plan.md](../../../docs/tsubu/implementation-plan.md)(Phase 0)を参照。

- `fixtures/<spec-area>/<rule-id>/{valid,invalid}/*.mts` — フィクスチャ。期待診断は `// @tsubu-expect <rule-id>` マーカーで表す。**Prettier から除外されており(ルート `.prettierignore`)、byte-for-byte で保存される。** リポジトリ自身の lint / tsc の対象でもない(意図的な違反コードを含むため)。
- `src/` — マーカーのパーサとフィクスチャ走査。
- `test/` — Phase 0 の構造検証(マーカー構文・ディレクトリ構造・ルール ID の妥当性)。エンジン実行(ESLint preset / 専用チェッカー)による診断照合は Phase 1 で追加する。

このパッケージは publish しない(`private: true`)。
