<!-- cspell:ignore tsgo -->

# @sumi-lang/cli

`sumi` コマンド(D-46 — [docs/sumi/decisions.md](../../../docs/sumi/decisions.md))。Sumi lint 層の `sumi check` と、既存の ESLint / oxlint 設定と併用するための config を提供する。

## `sumi check <project>`

1 コマンドで Sumi lint の検査を全部走らせる。`<project>` は tsconfig のパスか `tsconfig.json` を持つディレクトリ。

1. **拘束 compilerOptions の検証** — native tsc(`typescript-native`、TS 7)の `--showConfig` で実効設定を取り、[spec/compiler-options.md](../../../docs/sumi/spec/compiler-options.md) の拘束項目(`src/locked-compiler-options.mts`)と比較する。違反があればここで止まる(上書きされた設定での検査結果は言語の検査結果ではない — D-7 / D-40)。
2. **型検査** — 同じ native tsc で `--noEmit`。
3. **lint** — `--showConfig` が返す `files`(= プログラムの全ファイル)に対して @sumi-lang/oxlint-config の preset(oxlint native + tsgolint + sumi JS plugin)を実行する。

終了コード: 0 = 問題なし / 1 = 違反あり / 2 = 実行できない(tsconfig が無い等)。

ts-data-forge(287 ファイル)で tsgo 0.9 秒 + oxlint 1.1 秒(2026-09-07 実測)。

## 提供物

| export                             | 用途                                                                                                                                                                                    |
| :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@sumi-lang/cli/tsconfig`          | base tsconfig(`tsconfig.base.json`)。プロジェクトの tsconfig が `extends` する。拘束項目 + 自由項目の既定値                                                                             |
| `eslintConfigOffForSumiCheck`      | `sumi check` が既に検査する ESLint ルールを全て `off` にする flat config ブロック。既存 ESLint 設定の**末尾**に置く(二重検査の回避)。対応表は `src/configs/eslint-rules-by-rule-id.mts` |
| `@sumi-lang/cli/oxlint-config-off` | 同じく oxlint 用(`oxlint-config-off.json`)。自前の oxlint 設定から `extends` する。対応表(@sumi-lang/oxlint-config)から生成(`pnpm run gen:oxlint-config-off`)                           |
| `runCheck(project)`                | `sumi check` の本体(構造化された結果を返す)                                                                                                                                             |

Sumi の規則集合そのものを既存の oxlint 実行に混ぜたい場合は @sumi-lang/oxlint-config の `oxlintrc.jsonc` を `extends` する(同一エンジン内なので二重にはならない)。

## 予約されている動詞

`build` / `eject` / `test` / `fix` / `init` は D-46 のコマンド体系で予約済み。lint 層では未実装で、呼ぶとその旨を表示して終了コード 2 を返す。

## 開発

- `pnpm run sumi check <project>` — ソースから実行(tsx)。
- `pnpm run build` — `dist/cmd/sumi.mjs`(`bin`)を emit。
- `pnpm run test` — 一時プロジェクトを作って `runCheck` を end-to-end で確かめる(tsgo と oxlint を実際に起動する)。

このパッケージはまだ publish しない(`private: true`)。公開名は `@sumi-lang/cli`(npm org `sumi-lang` — D-50)、`bin` は `sumi`。
