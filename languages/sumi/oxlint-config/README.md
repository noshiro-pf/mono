# @sumi-lang/oxlint-config

Sumi lint の **oxlint preset**(Phase 1 のエンジン — [languages/sumi/docs/implementation-plan.md](../docs/implementation-plan.md))。

- `oxlintrc.jsonc` — 言語仕様どおりのルール集合。全 category を off にし、[enforcement-map.md](../docs/enforcement-map.md) の各行に対応するルールだけを明示的に有効化する。type-aware ルールは `oxlint-tsgolint` 経由。
- `src/plugin/` — **sumi JS plugin**。oxlint にネイティブ実装が無い言語ルール(`no-class` / `no-throw` / `no-try` / `no-enum` / `no-decorator` / `no-let-without-mut-prefix` / `no-constructor-call` / `no-in-operator` / `no-new-array` / `no-this` / `no-setter` / `no-using` / `prefer-arrow-function` / `generic-arrow-trailing-comma` / `no-global-type-shadow` / `require-readonly-type` / `no-internal-module-import` / `no-namespace-object-use` / `no-mixed-star-export` / `no-null-in-type`)。`pnpm run build` で `dist/plugin/index.mjs` に emit され、`oxlintrc.jsonc` の `jsPlugins` がそれを読む(oxlint は Node で plugin を読むため、`.mjs` 指定子を `.mts` に解決する jiti / vite の助けが無い — dist 経由が必要)。
- `src/rule-id-mapping.mts` — **中立ルール ID ← oxlint 診断コード**の対応表。適合性コーパス([../conformance](../conformance))はこの表で診断を正規化してマーカーと照合する。`oxlintrc.jsonc` と対で保守する(対応表に無いコードの診断は runner が失敗させる)。
- `test/` — `oxlintrc.jsonc`・対応表・plugin の三者同期の検査と、コーパス(`.mts` 専用)では表現できないケース(`.ts` / `.tsx` の `<T>`)を preset 経由で確かめる単体テスト。
- `src/run-oxlint.mts` — `oxlint -c oxlintrc.jsonc -f json --type-aware` をこのパッケージを cwd として実行し、診断を返すヘルパ。

使い方(コーパス runner から): `runOxlint(files)` → `diagnostics[].code` を `oxlintCodeToRuleId` で引く。

このパッケージは publish しない(`private: true`)。
