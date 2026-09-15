# Sumi

TypeScript のサブセット言語 **Sumi(澄)** の開発ディレクトリ。言語そのもの(目的・大原則・ロードマップ・仕様)は [docs/README.md](./docs/README.md) を、各パッケージの詳細はそれぞれの README を参照。このファイルは、どこに何があり、何がどう検査されているかの地図だけを書く。

## 構成

```text
languages/sumi/
  docs/            仕様書・決定ログ・対応表・コーパスの形式定義(ビルドも型検査もされない)
  oxlint-config/   @sumi-lang/oxlint-config   主エンジン: oxlint preset + sumi JS plugin + 診断コード → 中立ルール ID の対応表
  checker/         @sumi-lang/checker         型情報が要るルールを TypeScript 7 の API で走らせるチェッカー
  cli/             @sumi-lang/cli             `sumi check` コマンドと base tsconfig
  eslint-config/   @sumi-lang/eslint-config   ESLint 版 preset(D-43 以降は移行期のブリッジ)
  conformance/     @sumi-lang/conformance     エンジン非依存の適合性コーパス
```

| パッケージ                                     | 役割                                                                                                                                                                                            |
| :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@sumi-lang/oxlint-config`](./oxlint-config/) | 構文で決まるルール。`oxlintrc.jsonc` とその JS plugin、診断を中立ルール ID に揃える対応表、`@sumi-expect-error` マーカーのパーサ。plugin は `dist/` から読まれるのでビルドが要る                |
| [`@sumi-lang/checker`](./checker/)             | 型情報が要るルール(D-55)。oxlint の JS plugin は型情報を扱えないので、ここで別に実装する                                                                                                        |
| [`@sumi-lang/cli`](./cli/)                     | `sumi check <project>`: 拘束 compilerOptions の検証 → native tsc → oxlint preset + checker。当たった `@sumi-expect-error` の lint 診断を抑制し、当たらなかったマーカーを報告する                |
| [`@sumi-lang/eslint-config`](./eslint-config/) | eslint-config-typed + eslint-plugin-ts-data-forge に Sumi 用の上書きを重ねた preset。主エンジンではない                                                                                         |
| [`@sumi-lang/conformance`](./conformance/)     | `fixtures/<area>/<rule-id>/{valid,invalid}/*.mts` と、それを各エンジンにかけて `@sumi-expect-error` マーカーと照合するテスト。形式は [docs/conformance-corpus.md](./docs/conformance-corpus.md) |

依存の向きは `cli` → `checker` / `oxlint-config`、`conformance` → 全パッケージ(`checker` 以外は devDependency)。すべて `private: true` で、まだ publish しない。npm org は `sumi-lang`(D-50)。

`languages/sumi/` 自体は workspace member ではない(workspace glob は `languages/*/*`)。

## 何が検査されているか

### コーパスの fixtures

fixtures は意図的な違反コードなので、**リポジトリ自身の品質ゲートからは外してあり、Sumi のエンジンだけが読む**。

| 対象                              | fixtures の扱い                                                                                       |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------- |
| リポジトリの ESLint               | 対象外(`conformance/eslint.config.mts` の `ignores`)                                                  |
| リポジトリの tsc                  | 対象外(`conformance/tsconfig.json` の `include` に無い)                                               |
| Prettier                          | 対象外(ルートと `conformance/` の `.prettierignore`。byte-for-byte で保存するため)                    |
| knip                              | 対象外(`knip.jsonc` の project glob に無い)                                                           |
| `test/validate-fixtures.test.mts` | ディレクトリ構成・マーカー構文・ルール ID が既知かを検証する                                          |
| `test/engine.test.mts`            | oxlint preset・checker・native tsc の診断を合わせ、マーカーと**完全一致**(過不足ともエラー)で照合する |
| `test/eslint-bridge.test.mts`     | ESLint 版 preset の診断を、対応する中立 ID の分だけマーカーと照合する。既知の食い違いは理由付きで列挙 |

- **型検査は `fixtures/tsconfig.json` の設定で行う**(Sumi の base tsconfig の草案 — D-40)。invalid の fixture が出すコンパイラエラーは `compiler/<code>` のマーカーで表し、valid の fixture は型エラー 0 件でなければならない。
- `compiler/<code>` のマーカーはコーパスでだけ意味を持つ。`sumi check` の `@sumi-expect-error` は lint 診断だけが対象で(コンパイラエラーには `@ts-expect-error` がある)、fixtures に `sumi check` をかけるとこれらは unused と報告される。
- ESLint 版 preset のどのルールがどの中立 ID に当たるかは、`sumi check` が ESLint ルールを off にするための `cli/src/configs/eslint-rules-by-rule-id.mts` をそのまま使う。「このルールはこの ID の仕事を全部する」という表の主張を、コーパスで確かめる形になっている。

CI では `ws:build` の後の `ws:check:test:cov`(`code-check.yml`)でこれらが走る。手元では oxlint preset の `dist/` が要るので、先に `pnpm --filter @sumi-lang/oxlint-config run build` を実行する。

### パッケージ自身のコード

5 パッケージとも普通の workspace member で、`check:types` / `check:lint` / `check:test` / `check:cspell` を持つ。各パッケージの `check:test` の中身:

- `oxlint-config` — `oxlintrc.jsonc`・対応表・plugin の同期と、コーパスで表せない `.ts` / `.tsx` のケース。
- `checker` — ルールごとの RuleTester 形式のテスト。
- `cli` — 一時プロジェクトを作って `runCheck` を end-to-end で動かす(native tsc と oxlint を実際に起動する)。ESLint / oxlint の off 設定と拘束 compilerOptions の同期も。
- `eslint-config` — Sumi の上書きが flat config の合成後に実際に効いていること。コーパスとの照合は `conformance` 側。

## `sumi check` を手元で試す

エラーが出る状態そのものは CI で検査できないので、違反を含むデモプロジェクトを `cli/demo/` に置いてある(このパッケージの tsconfig / ESLint の対象外)。

```bash
pnpm --filter @sumi-lang/cli run sumi:demo
```

型エラー・lint 違反・抑制された `@sumi-expect-error`・当たらなかった `@sumi-expect-error` をまとめて報告し、終了コード 1 で終わる。

```bash
pnpm --filter @sumi-lang/cli run sumi:demo:options
```

拘束 compilerOptions を上書きしたプロジェクトで、最初の段階で止まる様子を見る。任意のプロジェクトには `pnpm --filter @sumi-lang/cli run sumi check <tsconfig かディレクトリ>` を使う(パスは `cli/` からの相対)。
