# mono

A monorepo for TypeScript projects: published libraries, applications, internal
tooling, and the Zenn articles published at <https://zenn.dev/noshiro_piko>.

## Setup

**Node and pnpm come from the repository, not from your shell's defaults.**
`tools/configs/node-support.json` is the single source of truth for the three
Node versions that matter here, and `pnpm run check:root:node-support` is what
keeps `engines.node`, `volta.node` and the compatibility matrix agreeing with
it:

| version           | what it is                                     |
| :---------------- | :--------------------------------------------- |
| `targets.current` | what a contributor builds on, and `volta.node` |
| `targets.lts`     | what is tested                                 |
| `targets.minimum` | the floor `engines.node` promises to consumers |

```sh
# Node: whatever pins it for you, at the version volta.node names
volta install node          # or: fnm use, nvm install, asdf …
corepack enable             # pnpm, at the version packageManager names

pnpm install
```

`packageManager` in the root `package.json` pins pnpm exactly, so `corepack`
is enough; installing pnpm globally works too as long as it satisfies
`engines.pnpm`.

Then, to check the checkout is sound:

```sh
pnpm run ws:build           # builds every package, in dependency order
pnpm run ws:test
```

`pnpm run check-all` runs everything CI does, in the order CI needs it, and
takes about fifteen minutes; the targeted commands under
[Commands](#commands) are the quick versions.

### What some packages need beyond that

Nothing above needs anything installed outside the repository. A few packages
do:

| what                                    | for                                                                                    |
| :-------------------------------------- | :------------------------------------------------------------------------------------- |
| `pnpm exec playwright install chromium` | the Playwright suites under `apps/*/e2e`, and `apps/split-view-extension`'s smoke test |
| `xvfb-run -a <command>`                 | those same suites on a machine with no display                                         |
| `zip`, `openssl`, `pass`                | packaging and signing `apps/split-view-extension` for the Chrome Web Store             |

Each package's own README says which of these it wants, and none of them is
needed to build, test or lint.

## Structure

- `libs/*` — 公開している npm パッケージ。1 ディレクトリ 1 パッケージ。
- `apps/*` — アプリケーション。
- `tools/` — リポジトリ内部向けのツール。
    - `tools/configs/` — root と各パッケージが共有する TypeScript / Vite / Rollup 設定。
    - `tools/scripts/cmd/` — リポジトリ全体のコマンド (`check-all`, `ws-build-stages` など)。
- `github/` — [github-settings-as-code](https://github.com/noshiro-pf/mono/tree/main/libs/github-settings-as-code) で適用する GitHub リポジトリ設定。
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
`scripts/`）と、削除する単独リポジトリから内容を取り込んだスナップショット
（`github-branches-viewer`, `life-plan-simulator`）が入っている。pnpm workspace の
glob から意図的に外してあるため、install・ビルド・lint・型チェックのいずれの対象にも
ならず、依存アップデートの影響を受けない。

取り込んだリポジトリは動く checkout ではなくスナップショットで、元の config 類が
残っていてもここでは一切動かない（実行されるのは root の `.github/workflows/` だけ）。
取得元・取得コミット・取り込まなかったものは、それぞれの `README.md` に記録して
ある。取り込むときは、default branch ではなく**作業が乗っているブランチ**から取る
こと（上の 2 つとも、残す価値のある内容は `main` に無かった）。

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
