# monorepo 統合レポート（2026-08-10 〜 08-11）

`noshiro-pf` 配下に分散していた 9 つの TypeScript ライブラリリポジトリを、履歴・タグ・リリースノートを保ったまま `noshiro-pf/mono` に統合した記録。

## 結果

| 項目                      | 値                                  |
| :------------------------ | :---------------------------------- |
| 統合したリポジトリ        | 9                                   |
| `libs/` の npm パッケージ | 16（+ `apps/synstate-docs`）        |
| コミット                  | 5025                                |
| タグ                      | 555（すべて `<repo>/` prefix 付き） |
| ミラーした GitHub Release | 550                                 |
| 追跡ファイル              | 7949                                |
| `.git` サイズ             | 69MB                                |
| 移植した未マージブランチ  | 10                                  |
| 移送した Issue            | 7                                   |

`articles/` `books/` は統合前（`2b25753`）から**差分ゼロ行**。Zenn の公開は無停止。

## 統合先の選定

`mono` は数年間メンテナンスされておらず、依存を更新すれば大量のエラーが出ることが分かっていた。それでも新規リポジトリ（`mono-lib` 等）ではなく `mono` を統合先にしたのは、

- `mono` の URL がスライド資料やドキュメント各所から参照されており、リネームや新設は移行期間中のリンク切れを招く
- 新設した場合、npm provenance の発行元・16 パッケージの `repository` フィールド・README のリンクをすべて二度書き換えることになる
- `mono` には既に `experimental/`（pnpm workspace の glob から除外されたディレクトリ）が存在し、動いていた

ため。3 番目が決め手で、旧コードをそこへ移すだけで依存更新の影響を完全に遮断できた。`packages/strict-ts-lib` が 269 workspace package のうち 191 を占めていたので、これを削除するだけで規模が 71% 減った（後継は `noshiro-pf/strict-typescript-lib`）。

## 手法

### 履歴の取り込み

`git subtree` ではなく **`git filter-repo`** を使った。`git subtree add` は履歴中のパスを書き換えないため、統合後に `git log -- libs/<pkg>` や `git blame` が境界で切れる。

```sh
git clone --no-local --single-branch --branch main <repo> /tmp/import/<repo>
cd /tmp/import/<repo>
git filter-repo --to-subdirectory-filter libs/<repo> --tag-rename ":<repo>/"
```

`--to-subdirectory-filter` が全コミットのパスを書き換えるので、統合後も `git log --follow` と `git blame` が元のリポジトリと同じように機能する。`--no-local` は必須（ハードリンクを使うクローンは filter-repo が拒否する）。

その後 mono 側で依存順に `git merge --allow-unrelated-histories` した。

### タグの衝突回避

`--tag-rename ":<repo>/"` で全タグに prefix を付けた。changesets へ移行済みの `ts-data-forge` / `ts-fortress` / `ts-type-forge` にも移行前の `vX.Y.Z` タグが 67 / 78 / 27 本残っていたため、一律 prefix 以外に衝突を避ける方法はなかった。`mono` 側のタグが 0 件だったことも幸いした。

統合後に changesets が発行する新しいタグは prefix なしの `<package>@<version>` 形式で、取り込んだ履歴と自然に区別できる。

### ディレクトリ構成

`libs/` は 1 ディレクトリ 1 npm パッケージ。`ts-data-forge` など内部に `packages/` を持っていた 4 リポジトリは取り込み後に平坦化した。`libs/<pkg>` は root から深さ 2 で、元の `<repo>/packages/<pkg>` と同じ深さになるため、パッケージ内の `../../configs/tsconfig/*` などの相対パスはそのまま解決される。

### Release の移送

タグは filter-repo で持ち込めるが、**GitHub Release はリポジトリに紐づくため API で作り直すしかない**。550 件を `--latest=false` 付きで再作成し、GitHub は Release の作成日時を遡及設定できないので、本文の先頭に元の公開日と旧 URL を挿入した。

```text
> Originally released on 2026-08-09 in [noshiro-pf/eslint-config-typed](…/releases/tag/v5.8.4).
```

`main` から到達できないブランチで切られた alpha プレリリース 3 件（`ts-codemod-lib/v1.4.0-alpha.1`・`.2`、`ts-repo-utils/v9.0.0-alpha.1`）はタグ自体が存在しないため作成していない。archive した旧リポジトリで引き続き参照できる。

ミラー直後は Release のタイトルが元のまま（`v5.8.4` 等）で、550 件中 490 件がバージョン番号だけだった。1 リポジトリ 1 パッケージだった時代の semantic-release 由来のもので、mono の Releases 一覧ではどのパッケージのリリースか判別できない。**タイトルを changesets が発行するものと同じ `<package>@<version>` 形式に統一した。**

パッケージ名はリポジトリ名から決め打ちせず、各リリースのタグが指す `libs/<repo>/package.json` の `name` を読んで解決した（`v*` タグの全期間で名前のブレはなかった）。

タグ側は `<repo>/v5.8.4` のまま据え置いた。既に prefix で識別できており、リネームすると 490 本の作成と削除に加えて Release の紐付け直しが必要になる。旧リポジトリ由来であることが形式から分かる利点もある。

### 未マージブランチの移植

当初の取り込みは `--single-branch --branch main` だったため他のブランチは入っていない。10 本を `migrate/<repo>--<branch>` として現在の `main` の上へパッチとして再生した。パスは新レイアウトへ写像し、`pnpm-lock.yaml` と `.cspell.config.yaml` は除外している（前者は再生成、後者は root が 9 リポジトリ分の統合辞書なので差分の文脈が一致しない）。17 コミット中 16 が適用でき、残る 1 件は辞書のみを変更するコミットだった。

description を持っていた 2 件は mono 側で PR 化した（#1548, #1549）。

## 判断とその理由

### 依存の結線

**runtime 依存のみ `workspace:` 化し、devDependency は published npm 版のままにした。**

`ts-repo-utils` のステージランナー（`runCmdInStagesAcrossWorkspaces`）は `dependencies` + `devDependencies` + `peerDependencies` を 1 つのグラフに合成し、指定子の種別に関わらずパッケージ名だけでエッジを張る。ツールチェーンは `eslint-config-typed` ↔ `ts-fortress` ↔ `ts-codemod-lib` のように相互依存しており（`ts-repo-utils` は自分自身も devDep に持つ）、これらを workspace リンクすると `ws:build` のトポロジカル順が存在しなくなる。

runtime 依存は `ts-type-forge` を根とする DAG なので安全に結線でき、5 段階のビルドに解決される。

プロトコルは公開時の semver レンジを変えないよう対応させた。`workspace:*` は publish 時に**厳密バージョン**へ展開されるため、一律に使うと公開レンジが狭まる。

| 元の指定  | 変換後        | publish 時 |
| :-------- | :------------ | :--------- |
| `^14.1.0` | `workspace:^` | `^14.1.0`  |
| `~9.1.3`  | `workspace:~` | `~9.1.3`   |
| 厳密指定  | `workspace:*` | `14.1.0`   |

兄弟パッケージへの devDependency は root へ集約した。`linkWorkspacePackages` は既定の `false` のままなので、明示的に `workspace:` と書いたものだけがローカルリンクされる。

### 設定ファイルの出所

root の `configs/` はテンプレート（`typescript-monorepo-template`）ではなく**統合したリポジトリ側**を採用した。テンプレートの `tsconfig.build.json` には TypeScript 7.0 が削除した `downlevelIteration` / `importsNotUsedAsValues` が残っており、9 リポジトリ側は既に対応済みだったため。

`tsconfig.build.json` は `tsconfig.type-check.json` を extends しているので、`lib` の上書きは両方に書く必要がある。`ts-type-forge` は `DeepReadonly<URL>` のように Node のグローバル型に対して厳密一致を検証しており、DOM lib が入ると別の型に解決されて落ちる。

### 旧リポジトリの扱い

削除ではなく **archive** した。Release 550 件・タグ・Issue・PR の URL がすべて生存し、Release 本文の compare リンク（`…/compare/v10.1.7...v10.1.8`）も機能し続ける。Actions は archive 前に無効化した（archive 後は read-only で設定変更できない）。

## 遭遇した問題

### codemod が型定義を書き換えた

root の `codemod:full` を取り込み直後のソース全体にかけた結果、`ts-type-forge` の型定義が壊れた。

```diff
- export type DeepPick<T, Path> = {
-   [K in keyof T as K extends DeepPickOmitHead<Path> ? K : never]: …
+ export type DeepPick<T, Path> = Readonly<{
+   [K in keyof T]: …
```

`convert-to-readonly` がキー再マッピング節を落とし、`DeepPick` が pick しない型になった。`DeepPickOmitHead` などが未参照になり、`noUnusedLocals` 下で declaration emit も落ちた。

原因は glob。`ts-type-forge` のリポジトリは codemod の対象を `packages/*/{scripts,test}/**` に限定していた — 型ライブラリの `src/` に readonly 変換をかけてはいけないため — が、root で採用した glob は全パッケージの `src/` と `samples/` を含んでいた。179 ファイルを取り込み時の内容へ復元し、codemod スクリプトに `--exclude` を追加した。

**教訓**: 各リポジトリの glob やツール設定は、そのリポジトリ固有の制約を反映していることがある。root へ統一する際は差分の理由を確認する。

### CI の前提が変わった

- `style-check` の `ws:doc` / `ws:check:ext` はビルドせずに走る。`workspace:` 化により兄弟パッケージの `dist/` が必要になったため、ビルドステップを追加した
- `node-version-compatibility` の `timeout-minutes: 10` は 2 パッケージ時代の設定。17 パッケージ × Node 3 バージョンでは足りず 30 分に引き上げた
- `main` ruleset の required status checks が、統合で削除した旧ワークフロー `lint-test-type-check` のジョブ名を要求していた。実在しないジョブを待ち続けるため全 PR がマージ不能だった
- `type-check` / `style-check` のマトリクスが `fail-fast: true` で、1 つの flaky なジョブが required checks を巻き添えにキャンセルしていた

### ブラウザテストの flakiness

vitest browser mode は各テストファイルを Vite dev server 経由で取得するが、並列取得が競合して `Failed to fetch dynamically imported module` が起きる。統合以前から存在し（単体の synstate リポジトリでも再現、失敗ファイルは毎回異なる）、`retry` では解決しない — ファイル自体が読み込めず、再実行すべきテストが存在しないため。ファイルを 1 つずつ取得するよう変更した。

### テストのリソース競合

`pnpm run --recursive` は既定で 4 パッケージを同時実行し、その中で vitest がさらに並列化する。17 パッケージでは CPU を過剰購読し、`eslint-config-typed` の typed-lint テストが 20 秒のタイムアウトを超えた（単独実行では 2.7 秒）。workspace レベルを直列化した。実際の並列性は各パッケージ内の vitest が持っているため、コストはほぼない。

## 今後の作業予定

### step 1 — mono の初期整備

- [x] Release にパッケージ名の prefix が付いておらずバージョン名だけでは区別がつかないのでリネームする
- [x] `configs/` `scripts/` を `tools/` へ移動する
- [x] devDependency の内部依存も npm package 経由から `workspace:*` 指定へ。cycle の解消方法を検討する
    - 自作パッケージの npm 公開版への依存は全廃した。`dist/` が 1 つも無い状態から `pnpm run ws:build` が通る
    - devDependencies は各パッケージへ移し、`packageDirs` から root を外して lint が過不足を検出するようにした。バージョンは `pnpm-workspace.yaml` の `catalog:` で一本化
    - 結果と理由は [package-dependencies.md](./package-dependencies.md) に記録した。依存関係の mermaid 図もそこにある
- [ ] 依存関係を最新化した状態で全パッケージを 1 回 publish する

### step 2 — 新規対応

- [ ] `strict-typescript-lib` を導入する
    - リポジトリ統合の可否は [strict-typescript-lib-integration.md](./strict-typescript-lib-integration.md) で検討した（結論: 統合しない）
- [ ] `pnpm-update` workflow を更新する
    - `main` が進んだら追従、を日次で実行する
    - 週次実行時、先週の分がマージされていなかったら新規 PR を作成せずそれを更新する
    - 現在の `pnpm-update.yml` は存在しない `update-packages` script を呼んでいる

### step 3 — 旧 mono の復元

- [ ] `experimental/` から utils・apps を依存のトポロジカル順に 1 つずつ復元する
    - 明示 import を省略するための `global-*` 系 utils は撤廃し、明示 import に書き換える

### その他の宿題

- `libs/*/configs/` に残る `rollup.config.mts` / `vitest.config.mts` / `tsconfig/` を `tools/configs/` へ集約する（5 パッケージは `configs/tsconfig/` を自前で持ったまま）
- root の `package.json` から、root 自身が使わなくなった devDependency（`rollup` 系・`typedoc` 系・`@vitest/*` など）を落とす。各パッケージ側の宣言は済んでいる
- `eslint.config.mts` は `eslint-config-typed` が既定で ignore するため lint されず、そこからの import だけは機械検証できていない
- `dist/` が無い状態の `pnpm install` は、自作 CLI の bin symlink を作れず警告を出す（ビルド後の再インストールで解消。実害はない）
- typedoc 出力を mono の GitHub Pages にサブパスで集約する（旧 6 リポジトリの Pages は配信継続・ビルド停止の状態）
- `ts-codemod-lib` の `peerDependencies.ts-repo-utils` が `8.1.0` 固定のまま（現行は 10.1.8）。公開レンジが変わるので changeset を切って直す
- `synstate` 配下 5 パッケージの `exports` が `dist/index.js` + `.d.ts`（他は `.mjs` + `.d.mts`）、`engines` / `publishConfig` も欠落している
- Codecov 設定を per-package flag つきの 1 本に統合する
