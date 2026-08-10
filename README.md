# mono

A monorepo for TypeScript projects: published libraries, applications, internal
tooling, and the Zenn articles published at <https://zenn.dev/noshiro_piko>.

## Setup

```sh
pnpm install
```

## Structure

- `libs/*` — 公開している npm パッケージ。1 ディレクトリ 1 パッケージ。
- `apps/*` — アプリケーション。
- `tools/*` — リポジトリ内部向けのツール。
- `configs/` — root と各パッケージが共有する TypeScript / Vite / Rollup 設定。
- `scripts/cmd/` — リポジトリ全体のコマンド (`check-all`, `ws-build-stages` など)。
- `agents/` — `AGENTS.md` の生成元 (`common-rules.md` + `local-rules.md`)。
- `github/` — [github-settings-as-code](https://github.com/noshiro-pf/github-settings-as-code) で適用する GitHub リポジトリ設定。
- `articles/`, `books/` — Zenn のコンテンツ。[Zenn](#zenn) を参照。
- `docs/` — 雑多なメモ。lint 対象外。
- `experimental/` — 旧 monorepo のコード。[experimental/](#experimental) を参照。

pnpm workspace のメンバーは `libs/*`, `apps/*`, `tools/*` のみ
（`pnpm-workspace.yaml`）。

## Commands

```sh
pnpm run check-all      # 全チェック（install, spell, markdown, type, build, test, lint, format）
pnpm run ws:build       # 依存関係の順にビルド
pnpm run ws:test        # 全パッケージのテスト
pnpm run fmt            # 未コミットのファイルを整形
pnpm changeset          # リリース用の changeset を追加
```

## Zenn

`articles/` と `books/` は、zenn.dev 側で設定された Zenn の GitHub 連携によって
公開されている。**このリポジトリのワークフローは一切関与していない。**
Zenn の仕様上、この 2 ディレクトリはリポジトリ直下になければならない。

そのため:

- **`articles/` と `books/` を移動・リネーム・ネストさせないこと。** CI は何も
  失敗しないまま公開だけが壊れる。
- 両ディレクトリは Prettier / ESLint / cspell / markdownlint の対象外。
  formatter のバージョンが上がるたびに公開済み記事が書き換わるのを防ぐため。
- ローカルプレビューは `pnpm exec zenn preview`。

## experimental/

`experimental/` には 2026 年以前の monorepo の内容（旧 `packages/`, `configs/`,
`scripts/`）が入っている。pnpm workspace の glob から意図的に外してあるため、
install・ビルド・lint・型チェックのいずれの対象にもならず、依存アップデートの
影響を受けない。

復活させる場合は、対象のパッケージだけを `libs/` または `apps/` へ移し、依存を
現行のライブラリへ移行する（`@noshiro/ts-utils` → `ts-data-forge`、
`@noshiro/ts-type-utils` → `ts-type-forge`、`@noshiro/io-ts` → `ts-fortress`）。

## Releases

リリースは [changesets](https://github.com/changesets/changesets) で管理している。
`libs/` 配下のパッケージに利用者から見える変更を加えたら `pnpm changeset` を実行する。
`main` へマージされると Release workflow が version PR を作成し、マージ時に npm へ
公開して GitHub Release を作成する。

タグの形式は `<package-name>@<version>`。
`eslint-config-typed/v5.8.4` や `ts-data-forge/ts-data-forge@14.1.0` のように
リポジトリ名が前置されたタグは、統合前の各リポジトリから取り込んだ履歴に対応する
ものであり、新規に作成することはない。

## License

Apache-2.0（`libs/` 配下の各パッケージも同じ）。

統合前の mono は MIT だったため、`experimental/` に退避したコードは MIT のもとで
公開されていた。その時点のライセンスは git 履歴に残っている。
