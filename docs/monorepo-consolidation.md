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

> この判断は統合直後のもので、その後撤回している。現在は devDependency も含めてすべて `workspace:` で、自作パッケージの npm 公開版への依存は残っていない。経緯と現在の規約は [package-dependencies.md](./package-dependencies.md) を参照。

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

### Release ワークフローが未公開バージョンを取りに行った

`ts-repo-utils` を 10.2.0 へ上げる最初の changeset で、main の Release が `changeset:version-packages` で落ちた。

```text
Package "ts-codemod-lib" must depend on the current version of "ts-repo-utils": "10.1.8" vs "8.1.0"
[ERR_PNPM_NO_MATCHING_VERSION] No matching version found for ts-repo-utils@10.2.0
```

`ts-codemod-lib` の `peerDependencies.ts-repo-utils` が `8.1.0`、`devDependencies` が `10.1.8` という**リテラル指定**で残っていた（`workspace:` 化から漏れた唯一の箇所）。changesets はリテラル指定を新バージョンへ書き換えるので、`pnpm install` が未公開の 10.2.0 を npm から取得しようとした。

`workspace:` プロトコルなら changesets は書き換えず、publish 時にレンジへ展開される。両方を `workspace:^` / `workspace:*` にして解消した。

これで install は通ったが、今度は `ts-codemod-lib` が patch の changeset に対して **major**（2.2.5 → 3.0.0）になった。changesets は「内部パッケージが `peerDependencies` に現れる場合、それが上がれば依存側は major」とみなすため、宣言レンジに新バージョンが収まっていても関係なく major になる。

ここで peerDependencies の使い方そのものを見直したところ、より深刻な問題が見つかった（下記）。CLI を別パッケージへ分離して内部 peer をゼロにしたため、この major も起きなくなった。

**教訓**: `workspace:` 化の監査は `dependencies` だけでなく `peerDependencies` も対象にする。lint も knip も「宣言の有無」しか見ないので、プロトコルの取り違えは検出できない。

### 公開していた CLI が動かなかった

上の peer 依存を調べる過程で、`ts-codemod-lib` が公開していた 5 つの CLI が**利用者の環境で 1 つも起動しない**ことが分かった。クリーンなプロジェクトで検証した結果:

```text
$ npm i -D ts-codemod-lib && npx convert-to-readonly --help
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'cmd-ts'
```

CLI が import する `cmd-ts` / `dedent` / `ts-repo-utils` が `peerDependenciesMeta` で `optional: true` にされていた。optional peer は npm がインストールもエラーも出さないので、失敗は実行時まで表面化しない。ライブラリ API（トランスフォーマ）の import は正常だった。

意図自体は妥当だった。`ts-repo-utils` は `tsx`（= esbuild、12MB）を依存に持つので、通常の `dependencies` にすればトランスフォーマだけを使う利用者にもそれが入る。

**CLI を `ts-codemod-cli` として別パッケージに分離**し、`cmd-ts` / `dedent` / `ts-repo-utils` をそちらの通常の `dependencies` にした。`ts-codemod-lib` はトランスフォーマだけを公開する。

- CLI 利用者: `npm i -D ts-codemod-cli` だけで動く（クリーン環境で変換まで確認）
- ライブラリ利用者: インストール内容は変わらない
- 副作用として内部 peer がリポジトリから消え、changesets の major 問題も一緒に解消した

**教訓**: optional peer は「入れなくても動く」ときにだけ使う。実行に必須なら optional にしてはいけない。公開物の検証は `pnpm pack` してクリーンな環境で実際に動かすのが確実。

### `ws:doc` がソースを空にした

`ws:doc` を並列実行すると `libs/ts-data-forge/src/**` の 113 ファイルが 0 バイトになった。単独実行（`pnpm --filter ts-data-forge run doc`）では再現せず、並列時のみ起きる。

原因は 2 つ重なっていた。

- 5 パッケージの `fmt` が `format-uncommitted` を `--cwd` なしで呼んでおり、**リポジトリ全体の未コミットファイル**を整形していた。統合前は「リポジトリ = パッケージ」だったので不要だった引数が、統合後に意味を持つようになっていた
- ビルドスクリプトが `tsx` の `paths` で自作パッケージを**ソース**へ解決するようになったため、あるパッケージのソースが書き換わっている最中に、別パッケージのツールがそれを読んで壊れる

`--cwd .` を 5 パッケージに追加し、ソースを書き換える workspace スクリプト（`ws:doc` / `ws:doc:embed` / `ws:doc:embed:jsdoc` / `ws:gi`）を `ws:test` と同じく直列化した。

### テストのリソース競合

`pnpm run --recursive` は既定で 4 パッケージを同時実行し、その中で vitest がさらに並列化する。17 パッケージでは CPU を過剰購読し、`eslint-config-typed` の typed-lint テストが 20 秒のタイムアウトを超えた（単独実行では 2.7 秒）。workspace レベルを直列化した。実際の並列性は各パッケージ内の vitest が持っているため、コストはほぼない。

### 型のみの依存をどちらに置くか

`libs/*` の `package.json` は `files` に `dist` だけでなく **`src` も含めている**。
`declarationMap` が有効なので、利用者のエディタで定義ジャンプすると
`dist/*.d.mts.map` を辿って `node_modules/<pkg>/src/*.mts` が開く。ジャンプ先で
元のソースが読めるようにするための意図的な設計。

したがって公開面は 3 つある。

| 公開面            | 何のために要るか   |
| :---------------- | :----------------- |
| `dist/**/*.mjs`   | 実行               |
| `dist/**/*.d.mts` | 利用者の型チェック |
| `src/**`          | 定義ジャンプ先     |

3 番目があるので、判断基準はこうなる。

> **`src/` が import するものは、値でも型でも `dependencies`（または
> `peerDependencies`）に置く。** devDependencies は利用者にインストールされない
> ので、ジャンプ先のソースで解決できなくなる。

具体例:

- `@types/estree`（`eslint-config-typed`）— 公開 `.d.mts` には露出しないが、
  `src/plugins/ts-restrictions/rules/no-restricted-syntax.mts` が import する。
  → `dependencies`
- `@types/micromatch`（`ts-repo-utils`）— 同様。`src/functions/gen-index.mts` の
  `import micromatch from 'micromatch'` に型を与える。→ `dependencies`
- `tsx`（`ts-repo-utils`）— `src/` から一切参照されない。→ `devDependencies`
- `ts-type-forge` — emit された `.d.mts` が `import("ts-type-forge").StrictOmit<…>`
  の形で明示的に名前を出す。→ `dependencies` 必須

`lint:published-deps` はこの基準をほぼ機械的に検査するが、**`@types/*` は盲点**。
`import @types/micromatch` と書く箇所は存在せず、「`micromatch` が自前の型を
持たない」という暗黙の関係なので、ルールからは見えない。実験して確認済み。

## 今後の作業予定

### step 1 — mono の初期整備

- [x] Release にパッケージ名の prefix が付いておらずバージョン名だけでは区別がつかないのでリネームする
- [x] `configs/` `scripts/` を `tools/` へ移動する
- [x] devDependency の内部依存も npm package 経由から `workspace:*` 指定へ。cycle の解消方法を検討する
    - 自作パッケージの npm 公開版への依存は全廃した。`dist/` が 1 つも無い状態から `pnpm run ws:build` が通る
    - devDependencies は各パッケージへ移し、`packageDirs` から root を外して lint が過不足を検出するようにした。バージョンは `pnpm-workspace.yaml` の `catalog:` で一本化
    - 結果と理由は [package-dependencies.md](./package-dependencies.md) に記録した。依存関係の mermaid 図もそこにある
- [x] knip を導入し、過剰宣言を検出できるようにする
    - 検出された 59 件の未使用宣言を削除した（root の `rollup` / `typedoc` 系、各パッケージの `markdownlint` / `prettier-plugin-*` など）
    - `eslint-config-typed` の公開 `dependencies` から `@types/eslint` と `typescript-eslint` も外した
- [x] 依存関係を最新化した状態で全パッケージを 1 回 publish する
    - npm 上の各パッケージの `repository` を調べたところ、**17 件中 16 件は既に mono から publish 済み**だった（`repository.url` が `noshiro-pf/mono`、`repository.directory` が `libs/<pkg>`）。統合後のリリースが一巡していた
    - 残っていた `octokit-safe-types` は 1.2.26 で mono から publish 済み。npm 上の `repository.url` が `noshiro-pf/mono` になったことを確認した。これで 17 件すべてが揃った
    - 依存の最新化そのものは `pnpm-update` の PR が担う
- [x] 旧リポジトリの URL を参照している箇所が無いかチェック。 synstate の logo のパスが死んでいるのを発見済み。
- [x] `github/` を `repo-settings/` にリネーム（ github-settings-as-code の破壊的修正）
    - `github/` は `.github/` の別名に見え、workflow もそこにあるという誤解を招いていた。読み込み元は `libs/github-settings-as-code/src/github/constants.mts` の 1 箇所だけがハードコードしていたので、そことディレクトリ本体・ヘルプ・README を書き換えた
    - 消費側の移行は `git mv github repo-settings` のみ。major の changeset を置いた
- [x] agents/ のルールをルートの AGENTS.md に集約し内容を整理、 AGENTS.md 自動生成スクリプトも削除。元々 many-repo で管理していた時代に AGENTS.md を自動で同期するための仕組みの名残だったが、 mono-repo 化により不要になった。
    - `agents/common-rules.md` + `agents/local-rules.md` を `AGENTS.md` へ畳み、生成スクリプト・`agents:gen` / `agents:sync` script・`sync-agent-config` workflow を削除した
    - 内容の整理で消えた食い違い: 冒頭が「submodule で共有しているので中央リポジトリを直せ」と指示していた（mono では偽）、コマンド一覧が単一パッケージ前提で `ws:*` を知らなかった、レイアウト説明が旧 `configs/` `scripts/` を指したまま root の `docs/` とパッケージの `docs/` を混同していた、`semantic-release` 前提のコミット規約が残っていた、`eslint-config-typed` へのリンクが旧リポジトリを指していた
    - `common-agent-config` は他リポジトリのために存続するが、mono はもう追従しない

### step 2 — 新規対応

- [ ] `strict-typescript-lib` を導入する — **前提が揃ったので着手できる**
    - リポジトリ統合の可否は [strict-typescript-lib-integration.md](./strict-typescript-lib-integration.md) で検討した（結論: 統合しない）
    - 一度着手して前提不足で止めていた。当時の最新ビルドは v6.0（peer range は `typescript >=6.0.0 <6.1.0`）で、mono の型チェックを担う `typescript-native` は TypeScript 7 だったため
    - **2026-08-13 に `dist-v7.0-0.0.0` が出た。** peer range は `typescript >=7.0.0 <7.1.0` で、mono の `typescript-native`（`npm:typescript@7.0.2`）と一致する。107 個の `@typescript/lib-*` を dependencies に持つメタパッケージを devDependency として入れる形
    - 導入手順は実測して [strict-typescript-lib-integration.md](./strict-typescript-lib-integration.md) の末尾に書いた。`libReplacement` が TypeScript 7 では既定 `false` であること、メタパッケージ 1 つでは pnpm が install を拒むこと、素朴に数えたエラー数（21,629 件）はビルド失敗の連鎖で実態は各パッケージ十数件であること
    - 土台（107 個の依存宣言と knip の ignore）は入れた。`libReplacement` はまだどこでも有効にしていないので挙動は変わらない
    - **導入コストは型エラーの件数では測れない。** strict lib の `@deprecated` が `@typescript-eslint/no-deprecated` に拾われ、`ts-fortress` では型エラー 4 件を直したあとに lint が 21 件残った。さらに `lint:fix` が strict lib 前提のコードに書き換えてしまい、`src` を配るパッケージでは消費者のエディタに赤が出る
    - **`src` を配るパッケージの方針は決まった（2026-08-15）。** strict lib 前提で書かれた `src` が、strict lib を使わない消費者の環境で一部型エラーになることは**許容する**。このリポジトリは関数の入出力に明示的な型注釈を強制しており、推論に頼る箇所が少ないため影響が小さい。`files` から `src` を外す案・`no-deprecated` を緩める案は採らない
        - 影響の実測は [strict-typescript-lib-integration.md](./strict-typescript-lib-integration.md) の「型チェック以外への影響」にある。`ts-fortress` では型 4 件を直した後に `no-deprecated` が 21 件残った
        - **この判断は #1613 で保留した箇所にも及ぶ。** `ts-data-forge` の `array-utils-search.mts` で、strict lib の形に書くと消費者側で赤が出るという理由からコメントアウトした `expectType` が 2 箇所ある。許容する方針になったので、strict lib の形に書き戻してよい
    - **繰り返し出ていた `Object.fromEntries` の `Partial` は解消した。** 半分は strict lib 側のバグで、キーの種類にかかわらず `string & {}` を足していたため `Record<string, V>` のキーまで union 扱いになっていた（[strict-typescript-lib#117](https://github.com/noshiro-pf/strict-typescript-lib/pull/117) で修正）。残り半分は entries 配列を経由する書き方そのものの限界なので、`Obj.map`（#1638）と `Obj.filter` / `Obj.filterMap`（#1642）を `ts-data-forge` に足して呼び出し側を移行した。標準 lib でも通るので opt-in を待たずに済ませられる。ただし #117 は mono が指す `dist-v7.0-0.0.0` より後の変更なので、新しい release が出て URL を貼り替えるまで lib 側の修正は届かない
    - 残りは**依存のトポロジカル順に 1 パッケージずつ opt-in** する
        - **opt-in 済み**: `octokit-safe-types`（型 0 件、#1614）
        - **PR 提出済み・未マージ**: `ts-repo-utils`（型 2 件・lint 7 件、#1618）。`ts-data-forge` は「どちらの lib でも同じに読める」形に揃えた #1613 があるが、opt-in 自体はまだ
        - **残りの件数**: `ts-fortress` 4 / `ts-type-forge` 6 / `ts-data-forge` 11
    - **`ts-data-forge` の opt-in は外部要因待ち。** `class X extends Map/Set` が strict lib 下でコンパイルできない（strict lib 側の型定義の問題）。**別スレッドで修正対応中で、リリースされたら連絡が来る**。それまで着手しない
        - もう 1 つ、`@eslint/plugin-kit` が `types.cts` をソースのまま配っているため `skipLibCheck` でも覆えない問題がある
    - 次に着手するのは `ts-fortress`（型 4 件は `feat/strict-ts-lib-fortress` に保全済み）→ `ts-type-forge`（6 件）→ 残り
- [ ] `libReplacement` のオンオフで `dist` が変わらないことを検査するスクリプトを `tools/scripts/` に追加する
    - opt-in のたびに手作業で確認している。`libs/*` の各パッケージについて、`libReplacement` を `true` / `false` にして `build` し、生成された `dist` に差分が無いことを検査する
    - **これが成り立つのは `@typescript-eslint/explicit-function-return-type` のおかげ**で、自動的に保証されるものではない。戻り値の型注釈が無い関数があると、`StrictLibInternals.ToObjectKeys<R>` のような strict lib 内部の型が `.d.mts` に漏れる。実測で確認済み（[strict-typescript-lib-integration.md](./strict-typescript-lib-integration.md)）
    - つまりこの検査は「消費者に配るものが lib の選択に依存していない」ことの回帰テストになる
- [x] `pnpm-update` workflow を更新する
    - 一度も動いていなかった。`update-packages` script が存在せず、changeset 生成が旧レイアウトの `packages/` を走査し、ブランチ名に日付が入っていて毎回別 PR になる構造だった
    - 日次実行にし、毎回 main から作り直す固定ブランチにした。これで「main への追従」と「既存 PR の更新」が同時に満たされる
    - 抑止対象は `pnpm-workspace.yaml` の `update.ignoreDeps` が単一の情報源。`typescript` はエイリアス `typescript-native` も含めて守られることを実測で確認した
    - **その後 1 回だけ動いて失敗した**（run 31644690884）。`update.githubActions: true` が `.github/workflows/` の action ピンも書き換えるため、App トークンに `workflows` 権限が無く push が拒否されていた。#1583 で付与済み
    - さらに、成功していたとしても 2 回目以降は必ず落ちる作りだった。`git push --force-with-lease` を値なしで使っているが、比較先の remote-tracking ref は `actions/checkout` が既定ブランチの分しか作らないため存在せず、既存ブランチへの push が `stale info` で拒否される（手元で再現・修正後に 3 連続実行が通ることも確認）。期待値を明示する形に変えた
    - `gh pr view <branch>` は merge 済みの PR も拾うため、1 回目がマージされた翌日は「PR 作成をスキップ→閉じた PR に auto-merge を付けようとして失敗」になる。state が `OPEN` のものだけを見るようにした
- [x] `chore/pnpm-update` がエラーになったら自動で Claude を起動して修正する workflow を追加する — **`auto-fix-pnpm-update.yml` を追加した。ただし secret を入れるまでは何もしない**
    - **その後 `auto-fix-pnpm-update.yml` は削除した。** `CLAUDE_CODE_OAUTH_TOKEN` を入れないまま何も動かない状態が続いたため。以下は当時の検討の記録
    - 依存更新そのものは自動化できたが、**追随作業は人が要る**ことが分かっている。実例として `eslint-plugin-unicorn` v73 の major 更新は新ルールを 5 つ追加し、`eslint-config-typed` のルール表が `satisfies` を満たせずビルドが落ちて、PR の 20 チェック中 14 件が失敗した。修正内容は「新ルールに設定を与える」という定型作業
    - 起動条件は `workflow_run`（`pnpm update` の完了、または `chore/pnpm-update` に対する CI の失敗）が素直。どちらを見るかは、失敗が「workflow 自身の失敗」か「作られた PR の CI 失敗」かで分かれるので両方拾う必要がある
    - 検討が要る点
        - **権限**: main への push は不可。Claude にはブランチへの push と PR の更新までを許す
        - **暴走防止**: 同じ失敗で無限に起動しないよう、1 回の失敗につき 1 回まで。修正 commit が既に載っているブランチでは起動しない
        - **判断が要る修正は止める**: 上の unicorn の例では「どのルールを有効にするか」に判断が入った。機械的に直せない場合は PR にコメントを残して人に渡す
        - 失敗の内容を渡す手段（ログの取得と要約）
    - 実装した形。上の 4 点はいずれも設計に落とした
        - job は 2 つに分けた。**CI が `chore/pnpm-update` で失敗した場合**はそのブランチに commit を push する（既存 PR の auto-merge がそのまま効く）。**`pnpm update` 自身が失敗した場合**はブランチが無いことがあり原因も workflow 側なので、別 PR を作らせる
        - **暴走防止は commit 数で数える。** `fix(deps): ` で始まる commit を `origin/main..HEAD` から数え、2 回で打ち切る。`pnpm update` は毎日 main からブランチを作り直すので、カウンタは放っておいてもリセットされる
        - **push は App トークンで行う。** `GITHUB_TOKEN` の push は後続の workflow を起動しないため、修正しても CI が再実行されず PR は赤のままになる
        - ログの取得は `additional_permissions: actions: read` と App の `permission-actions: read`
        - **`CLAUDE_CODE_OAUTH_TOKEN` を入れるまで、この workflow は何もしない。** 最初の step が secret の有無を見て、無ければ run summary にその旨を書いて残りを skip する。CI は緑のまま
        - 認証は `claude_code_oauth_token`。**subscription 契約で課金される**のはこちらで、`anthropic_api_key` は API 側の課金になる
        - **長命トークンを secrets に置かない形は、subscription では今のところ取れない。** action は workload identity federation（`anthropic_federation_rule_id` + `anthropic_organization_id`）に対応しており、GitHub の OIDC トークンを交換するので secrets に鍵を残さずに済むが、これは Anthropic の **organization**（＝ API 側）に対する認証で、subscription には指す先の rule が無い
- npm package のテスト
    - [x] 現在のリポジトリのソースコードをローカルに npm pack して動作するかチェックするテストを追加する
        - `pnpm run verify:npm-packages`（`tools/scripts/cmd/verify-npm-packages.mts`）。17 パッケージを pack し、`verify-npm-packages/local/` にパッケージごとの project として install して、それぞれに対して小さなプログラムを実行する。`main` / `module` / `types` / `exports` / `bin` が指すパスが tarball に実在するかも検査する。type-check.yml の matrix に追加済み
        - 過去に実際に出荷した 2 種類の不具合を再現して検出できることを確認した（synstate の存在しない `module` / `types`、bin が使う依存を devDependencies に置いた場合の `Cannot find package`）
        - **消費側の install は `hoist: false` が必須。** pnpm 既定の hoisting だと、依存を宣言し忘れたパッケージでも `node_modules/.pnpm/node_modules` 経由で解決できてしまい、検査が素通りする（実測で確認）
    - [x] pnpm publish された最新バージョンを install して動作するかチェックするテスト workspace を追加する
        - `verify-npm-packages/` に常駐の workspace を 2 つ置いた。`local/` は pack した tarball、`published/` は npm の `latest` を install する。チェック本体は `smoke/<pkg>.mjs` の 1 箇所だけで、両空間の中身はそこから生成してコミットしている
        - `published/` は `local/` より古いことがあるため PR のゲートにはせず、日次の workflow で回す

### step 3 — 旧 mono の復元

- [ ] `experimental/` から utils・apps を依存のトポロジカル順に 1 つずつ復元する
    - 明示 import を省略するための `global-*` 系 utils は撤廃し、明示 import に書き換える
    - 何を復元するかを決められるように、74 プロジェクトを「後継あり / 判断が要る / 中身が無い」に分類した → [experimental-inventory.md](./experimental-inventory.md)
    - 各 app が連れてくる utils は `dependencies` から実測してある。**連れてくる utils が「なし」の 3 つ**（`lambda-calculus-interpreter-core` 750 行、`poll-discord-app` 2008 行、`event-schedule-app-shared` 5203 行）から始めれば、置換だけで済む
    - **12 パッケージを復元し、いずれも `apps/` に private で置いた**（2026-08-14〜15）。置き場は npm の公開状況で決めた。詳細と、その過程で分かったことは [experimental-inventory.md](./experimental-inventory.md) にある

        | パッケージ                         | 行数 | PR    |
        | :--------------------------------- | ---: | :---- |
        | `poll-discord-app`                 | 2008 | #1620 |
        | `lambda-calculus-interpreter-core` |  750 | #1621 |
        | `io-ts-types`                      |  352 | #1624 |
        | `event-schedule-app-shared`        | 5203 | #1625 |
        | `better-react-use-state`           |   75 | #1627 |
        | `tiny-router-observable`           |  185 | #1628 |
        | `tiny-router-react-hooks`          |  140 | #1629 |
        | `numeric-input-utils`              |  287 | #1630 |
        | `react-utils`                      |  487 | #1631 |
        | `resize-observer-react-hooks`      |   55 | #1632 |
        | `react-utils-styled`               |  347 | #1633 |
        | `react-blueprintjs-utils`          | 4432 | #1634 |

    - **`event-schedule-app` 本体（21136 行・314 ファイル）は作業中。** ブランチ `feat/restore-event-schedule-app` に置いてある。型エラーは 3567 件から 0 件になり、lint が 130 件残っている段階
        - 作業の中身は「移植」ではなく「書き換え」だった。`globals.d.ts` の 10 行が**約 90 個の識別子を import 無しで使えるようにしており**、21136 行がその前提で書かれていた。撤廃すると 3567 件になる
        - `.ts` / `.tsx` から `.mts` への改名が 190 ファイル、相対 import への拡張子付与が 220 ファイル
    - **`syncflow` → `synstate` で最も手間だったのは `createState` の扱い。** 3 段階で前提が誤っていた — ①パッケージの選択はファイル単位で決まる（誤）→ ②呼び出しごとに決まる（不十分）→ ③**同一ファイルが同じ関数名で両方の版を必要とする**（正）。`synstate` は observable を、`synstate-react-hooks` は hook を返す
    - **`ts-data-forge` の API 変更で繰り返し当たったもの**: 参照系が `Optional` を返す（`IMap.get` / `Arr.first` / `Arr.last` / `Arr.maxBy`）、非破壊操作が `to…` 形に改名（`toSortedBy` / `toUpdated`）、`NonEmptyArray` と `FixedLengthArray` が brand 付きになった（分解する側は `FixedLengthTuple` が正解）
    - **後継が無く移植したもの**は各パッケージの `src/utils` にある。`match` / `mapOptional` / `noop` / `DateUtils` / `Obj.set` 系 / `Paths` / `hasKeyValue` / `createTinyObservable` / 曜日・月名の定数など

### その他の宿題

- **published パッケージの検査が main で一度も走っていなかった（修正済み）。** `verify-published-packages` は `github.event.before` と比較してピンの変更を判定するが、checkout が浅いためその commit がリポジトリに存在せず、`git diff` が `fatal: bad object` で落ちていた。判定は `git diff … | grep -q .` の形で、パイプラインの終了ステータスは `grep` のものになるため、**失敗が「変更なし」として素通り**していた（run 31685428368 のログに残っている）。`should-run-type-check` と同じ壊れ方
    - `fetch-depth: 0` にして、判定を変数への代入に変えた。代入なら `set -e` で止まる。ブランチ側の比較も merge base にした
- **リポジトリ設定のバックアップ照合を、関係のないブランチで走らせないようにした。** `backup-repository-settings` は GitHub の現在の設定とコミット済みバックアップを突き合わせるが、これはブランチではなくリポジトリの性質で、ブランチ側からは変えようがない。全ブランチで走らせていたため、web UI で設定を 1 つ変えると**開いている全 PR が赤くなる**（8/13 に ruleset から `migrate/**` を外したときに実際に起きた）。main では常に、それ以外のブランチでは `repo-settings/` に差分があるときだけ走るようにした
    - 差分は main の先端ではなく merge base と比較する。先端と比較すると、branch が fork した後に main のバックアップが動いた場合に「このブランチが触った」と誤判定し、古いファイルで照合して落ちる。実測すると、`7586d80d9` で fork したブランチは 2 点間 diff では 10 ファイル、merge base 比較では 0 ファイルになる

- ~~`libs/*/configs/` に残る `vitest.config.mts` を `tools/configs/` へ集約する~~ → 対応済み
    - `tsconfig/` は対応済み。自前のコピーを持っていたのは 6 パッケージで、共有側が先に進んでいたため中身が古くなっていた（`importHelpers` が消えている、`jsx` が増えている等）。すべて `tools/configs/tsconfig/` を extends する形にし、`tsc --showConfig` の差分で解決後の設定が変わらないことを確認した
    - node 専用パッケージの `lib` を `["ESNext"]` に絞る指定は `tools/configs/tsconfig/tsconfig.node-only.json` に切り出した（3 パッケージが extends）
    - `rollup.config.mts` も対応済み。15 本中 14 本が同一の内容だったので `tools/configs/rollup-config.mts` に集約し、各パッケージは 7 行になった。生成物 1519 ファイルの md5 が前後で全て一致することを確認済み。`@rollup/plugin-replace` / `@rollup/plugin-strip` / `rollup-plugin-esbuild` の宣言も 38 箇所から root の 1 回になった。`eslint-config-typed` だけは `@rollup/plugin-typescript` を使う別物なので据え置き
    - `vitest.config.mts` も対応済み。自前で書いていた 10 パッケージを `tools/configs/vite-config.mts` に寄せ、757 行 → 344 行 + 共有 146 行になった。各 config を import して解決後のオブジェクトを比較し、6 個は完全一致、残り 9 個の差分が意図した 3 種類だけであることを確認した（`includeSource` の `[]` 明示、`fileParallelism` の `true` 明示、synstate 5 個の typecheck tsconfig パス修正）。`ws:test` のファイル数・テスト数も前後で一致
    - パッケージごとの `include` / `includeSource` の食い違い（15 パッケージで 6 通り / 4 通り）はそのまま残した。揃えるとテスト対象が変わるので、置き場所の統一とは別の判断になる
- **`libs/*/configs/tsconfig.build.json` にコメントを書いてはいけない。** 各パッケージの `configs/rollup.config.mts` が `import tsconfig from './tsconfig.build.json' with { type: 'json' }` で読んでおり、JSON import は strict JSON なので esbuild が `JSON does not support comments` で落ちる。共有側の `tools/configs/tsconfig/*.json` は extends されるだけなのでコメントを書ける
- ~~`eslint.config.mts` は `eslint-config-typed` が既定で ignore するため lint されず、そこからの import だけは機械検証できていない~~ → 対応済み。`lint:published-deps` の pass（`tools/configs/eslint.published-deps.mts`）に 19 ファイル分の config object を足して、`import-x/no-extraneous-dependencies` を devDependencies 許可で掛けるようにした
    - 新しい job を作らず既存の pass に相乗りさせたのは、job 名が増えると ruleset の required status checks を更新する必要があり、更新前に旧名が消えると全 PR がマージ不能になるため（統合時に一度踏んでいる）
    - 効くことは実測で確認した。`libs/synstate/package.json` から `eslint-plugin-ts-fortress` を消すと `libs/synstate/eslint.config.mts` の import が落ちる
    - **root の `eslint.config.mts` だけは workspace パッケージの import を検出できない。** シンボリックリンクを解決した先が root 自身の配下（`libs/*`）になるため、rule が内部モジュールと見なして飛ばす。パッケージ配下からは自分の外に解決されるので検出できる。root からの外部パッケージの import は検出できる（`import 'dedent'` を足して確認）
- ~~knip の unused files / unused exports は CI ゲートに入れていない~~ → 一部をゲートに入れた。「大量に出る」と書いていたが、実際に全件を見たら unused files 5 件・unused exports 1 件・unused exported types 8 件・duplicate exports 21 件・unused catalog entries 3 件で、選別できる量だった
    - ゲートを `dependencies,unlisted,binaries` から `dependencies,unlisted,binaries,unresolved,catalog,catalogReferences` に広げた。**宣言に関する指摘だけ**をゲートにし、到達可能性に関する指摘（`files` / `exports` / `types` / `duplicates`）は入れていない。job 名は `knip` のままなので ruleset の required checks は変わらない
    - 死んでいた catalog entry を 3 件消した。`@types/argparse`（argparse は自前で型を持つ）・`fast-glob`（`ts-repo-utils` が dependencies にリテラル指定で持つ）・`tslib`（`importHelpers` の削除と一緒に消えるはずだった）
    - `libs/ts-codemod-lib/test-code/**` は `fs.glob('test-code/**')` で実行時に読むフィクスチャなので ignore に理由付きで追加した
    - **`files` と `exports` をゲートに入れないのは、まだ使われていない export が「実装途中」の姿だから。** これで CI が落ちると、チェックが「回避するもの」になってしまう
    - **加えて knip には見えない参照がある。** `libs/synstate/scripts/cmd/run-benchmark-deep-chain.mts` は throughput デモの adapter を `await import(<計算されたパス>)` で読み、結果を `any` として使う。そのため `createRxJSThroughputAdapter` は unused と報告されるが、実際はそのベンチマークの RxJS 行そのものだった。一度これを信じて削除しかけている
        - ただしこのスクリプトは**現在動かない**。統合で docs が `apps/synstate-docs` へ移ったのにパスが旧レイアウトの `packages/docs` 前提のままで、`ERR_MODULE_NOT_FOUND` になる（別途修正が要る）
- `dist/` が無い状態の `pnpm install` は、自作 CLI の bin symlink を作れず警告を出す（ビルド後の再インストールで解消。実害はない）
- ~~typedoc 出力を mono の GitHub Pages にサブパスで集約する~~ → 実装した。旧 6 リポジトリの Pages は配信継続・ビルド停止で、統合以降のドキュメントの変更がどこにも出ていない状態だった
    - `noshiro-pf.github.io/mono/` 配下に、typedoc 5 パッケージ（ts-codemod-lib / ts-data-forge / ts-fortress / ts-repo-utils / ts-type-forge）と Astro の docs サイト（synstate）を並べる。生きている旧 Pages 6 件とちょうど同じ顔ぶれ
    - `tools/scripts/cmd/build-pages-site.mts` が各パッケージのビルド済み出力を `_site/` に集めて索引を作る。typedoc を持つパッケージは `configs/typedoc.config.mjs` の有無で見つけるので、増えても直さなくてよい
    - `apps/synstate-docs` の `base` が `/synstate/` → `/mono/synstate/` に変わる。**コンテンツ側に `/synstate/` 直書きのリンクが 210 箇所あり**、そのままだと全部 404 になるので併せて書き換えた（favicon の 3 箇所は `astro.config.mjs` 側）
    - **Pages の有効化は別作業。** `repo-settings/pages/settings.json` に `build_type: workflow` を宣言してあるので、`pnpm run repo-settings:apply` の実行が要る。それまで deploy job は失敗する
- ~~`synstate` 配下 5 パッケージの `exports` が `dist/index.js` + `.d.ts`（他は `.mjs` + `.d.mts`）、`engines` / `publishConfig` も欠落している~~ → 対応済み。実際に食い違っていたのは `exports` ではなく legacy な `module` / `types` フィールドで、ビルドが一度も出力していないファイルを指していた（publint で確認）。`engines` / `publishConfig` も他パッケージに合わせた
- ~~Codecov 設定を per-package flag つきの 1 本に統合する~~ → `codecov.yml` に component を 15 個定義して対応。flag ではなく component を使ったのは、flag はアップロード時に付けるものでパッケージごとに 1 回ずつアップロードする必要があるのに対し、component は `codecov.yml` だけで path で切り分けられるため（[Codecov docs](https://docs.codecov.com/docs/components)）。README のバッジも `?component=<pkg>` を指すようにした
- **`paths-ignore` で workflow ごと skip していた 2 本が、特定の PR をマージ不能にする状態だった（修正済み）。** `style-check` は `**.png` / `**.jpg`、`node-version-compatibility` は `.gitignore` を trigger 段階で除外していた。GitHub は path filter で skip された workflow の job を報告しないので、その job が required status check になっていると **PR は永久に checks を待ち続ける**。ruleset が要求する 20 件のうち `style-check (*)` が 5 件、`test-node-versions (*)` が 3 件で、画像だけを変更する PR（追跡している png / jpg は 355 件）と `.gitignore` だけを変更する PR がこれに該当した
    - type-check.yml のコメントが「required status check に含めるため workflow ごとではなくステップ単位で skip すること」と既に書いていた規約で、この 2 本だけが破っていた。統合時に「実在しない job を待ち続けて全 PR がマージ不能」を踏んだのと同じ形
    - `node-version-compatibility` の `.gitignore` はそもそも冗長だった。ステップ側のゲート `check-should-run-type-checks` の既定 ignore リストに `.gitignore` が入っている
- **`should-run-type-check` ゲートが main への push で全ステップをスキップさせていた（修正済み）。** ゲートは `origin/main` との diff を見るが、main への push では HEAD 自身との比較になり diff が空になる。空の diff は「関係する変更なし」と解釈されるため、type-check.yml と node-version-compatibility.yml の全ステップがスキップされ、しかもジョブは success を返していた。ゲート導入（8/12 06:00 UTC 頃）以降、main では型チェックも lint も knip も coverage upload も一度も走っていなかった。main では push 前の commit（`github.event.before`）と比較するようにした
    - Codecov のダッシュボードで component 別 coverage が空だったのはこれが原因。component の設定自体は正しく動いており、PR ブランチでは per-package の値が出ている（`components/?branch=<branch>` で確認）
- ~~**browser テストが実質走っていないパッケージが 4 つある。**~~ → 対応済み。`synstate-preact-hooks` / `synstate-preact-signals` / `synstate-react-hooks` / `synstate-react-hooks-compat` の 4 パッケージにテストを書いた。`passWithNoTests: true` により `No test files found, exiting with code 0` で成功扱いになっていた
    - hooks の 3 パッケージは、レンダリングを要するものを `test/browser/` に置き、Browser project だけが拾うようにした（node project の `include` を `test/*.test.mts` までに絞る）。レンダリングには `@testing-library/react` / `@testing-library/preact` を使う
    - hooks 本体は browser でしか動かないため、この 3 パッケージだけ `test:cov` を全 project 実行に変えた。合わせて `ws:test:cov` の job でも chromium を install する。statement coverage は 0% / 0% / 23.52% → いずれも 100%
    - テストが本当に効いていることは、`useObservableValue` の購読解除を no-op に差し替えると 18 件中 7 件が落ちることで確認した
- ~~**`synstate` の browser テストが不安定。**~~ → 対応済み。原因は Vite の依存プリバンドルだった。テストファイルを走査して見つからなかった依存は初回 import 時に最適化され、そこでページがリロードされる。リロードに巻き込まれたファイルが `Failed to fetch dynamically imported module` になる（毎回違うファイルが落ちるのはこのため）
    - 各パッケージの `optimizeDepsInclude` に取りこぼしていた依存を列挙して解消した。`node_modules/.vite` を消してからの実行で、synstate は列挙前 4/4 失敗・列挙後 6/6 成功。warm なら列挙の有無にかかわらず通るので、CI でだけ落ちていた
    - 取りこぼしは 2 種類ある。ワークスペース内の別パッケージが import しているもの（`ts-data-forge > @sindresorhus/is` のように、自分の依存ではないので `>` 記法で辿る必要がある）と、走査が届く前に import されるもの
    - `nick-fields/retry` による 2 回試行と `ts-codemod-lib` の `retry: 2` は外した。原因が消えた以上、失敗は再試行するものではなく失敗として扱う
- ~~**Codecov のパス解決が同名ファイルを取り違えている。**~~ → 対応済み（後述の方法で修正）。以下は問題の記録。 `synstate-react-hooks` / `synstate-preact-hooks` / `synstate-react-hooks-compat` は同じ相対パス（`src/create-boolean-state.mts` など）を持つが、Codecov 上には `synstate-react-hooks` の分しか存在しない（[API](https://api.codecov.io/api/v2/github/noshiro-pf/repos/mono/report/) で確認）。lcov の `SF:` はパッケージ相対なので、1 回のアップロードで全パッケージ分をまとめて渡すと、同名パスがどれか 1 つに畳まれてしまう。component は path で切るので、この取り違えは component では直せない。パッケージごとに `directory` を指定してアップロードを分けるか、lcov のパスをリポジトリルート相対に直すかの選択になる
    - 現状の実害は小さい。畳まれている 3 パッケージはいずれもテストが 0 件で、係数自体に意味が無い
    - **修正**: `pnpm run coverage:normalize-paths` を `ws:test:cov` の後段に入れ、各 `lcov.info` の `SF:` をリポジトリルート相対に書き換えるようにした。Codecov に推測させる余地が無くなる。ローカルでは 3 つのミラーパッケージが別々のパスになることを確認済み
    - **確認済み**: main へマージ後の upload で、`components/?branch=main` が 15 component すべてに値を返すようになった（`synstate-preact-hooks` と `synstate-react-hooks-compat` は `null` から 0% へ。当時はまだテストが 0 件だったので 0% が正しい値）
