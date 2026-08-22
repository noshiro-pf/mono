# strict-typescript-lib 設計ドキュメント

> **この文書は per-lib 分割時代（〜2026-08）の設計記録である。**
> 現在は TypeScript マイナーごとに 1 パッケージで、両 flavor を
> `libs/` と `libs-branded/` として同梱する。現行の配布については
> [distribution.md](./distribution.md) を参照。


TypeScript 標準 lib (`lib.es5.d.ts` など) を厳格化した置き換え用型定義を、TypeScript の各バージョンごとに npm パッケージとして生成・配布するためのリポジトリ。

参考実装: 既存の private な参照実装をベースにしている。

## 1. 決定事項サマリ

| 項目                | 決定                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo 構成           | pnpm モノレポ + TS バージョン別パッケージ                                                                                                                        |
| 型ユーティリティ    | `ts-type-forge` (peerDependencies)                                                                                                                               |
| npm 名 prefix       | スコープなし (`strict-ts-lib-...`)                                                                                                                               |
| TS バージョン token | `v5.7` (ドット付き)                                                                                                                                              |
| Branded 配布        | 別 npm パッケージ。命名順序は `strict-ts-lib-v{TS}-branded-{lib}`                                                                                                |
| ベース              | the source repo をベースに the reference monorepo の branded configs を復活                                                                                      |
| 生成ツールチェーン  | `tsx` 直接実行 (the source repo 流)                                                                                                                              |
| 補助ライブラリ      | `ts-repo-utils` / `ts-data-forge` (参考実装の private な node-utils の代替)。`any`→`unknown` / readonly 付与は `typescript` を使った自前の text-splice transform |
| ライセンス          | Apache-2.0                                                                                                                                                       |
| 配布レジストリ      | npmjs.com (Changesets で公開)                                                                                                                                    |
| 生成物の git 管理   | コミットする (diff レビューと CI 安定のため)                                                                                                                     |
| 実装順              | v5.7 → ≥4.5 & <6.0 → ≥6.0 → ≤4.4                                                                                                                                 |

## 2. リポジトリ構成

現在の typescript-template scaffold (`src/`, `samples/`, `configs/rollup.config.ts`, `vite.doc.config.mts`, `vitest.config.mts` 等) は撤去し、pnpm モノレポに置き換える。`CLAUDE.md` / `.github` / `.oxfmtrc.json` / `eslint.config.mts` / `LICENSE` 等の共通設定は流用する。

```text
strict-typescript-lib/
├── package.json                         # workspace root (private: true)
├── pnpm-workspace.yaml
├── tsconfig.json                        # dogfood 型チェック (libReplacement=v5.9 strict lib)
├── tsconfig.tooling.json                # build tooling 一括型チェック (stock lib)
├── eslint.config.mts                    # リポジトリ唯一の ESLint flat config
├── .oxfmtrc.json / .oxfmtignore / .gitignore / ...
├── .changeset/                          # 公開時の changesets ファイル
├── CLAUDE.md                            # エージェント向け指示 (手書き)
├── README.md
├── docs/
│   └── design.md                        # 本ドキュメント
├── configs/
│   └── tsconfig/
│       ├── tsconfig.type-check.json     # 共通ベース (libReplacement:false, strict)
│       ├── tsconfig.lib-check.json      # 生成 lib 検証ベース (dom flavor)
│       ├── tsconfig.lib-check.webworker.json
│       └── lib-check-entry.ts           # lib-check 用の空 entry
├── scripts/
│   ├── project-root-path.mts
│   └── cmd/
│       ├── check-all.mts
│       ├── create-changeset.mts         # 全公開パッケージの changeset 一括生成
│       ├── gen-version-diff.mts
│       └── ws-gen-stages.mts / ws-gen-full-stages.mts / ws-gen-with-codemod-fixed-stages.mts
├── scripts-common/                      # TS バージョン横断の生成ロジック
│   ├── package.json                     # name: "strict-ts-lib-scripts-common", private: true
│   └── src/
│       ├── commands/                    # entry points
│       │   ├── gen.mts
│       │   ├── gen-full.mts
│       │   ├── gen-min.mts
│       │   ├── gen-lib-files.mts
│       │   ├── gen-packages.mts
│       │   ├── gen-ci.mts
│       │   ├── fmt-diff.mts
│       │   └── publish-packages.mts
│       ├── functions/
│       │   ├── fetch-lib-files.mts
│       │   ├── gen-lib-files.mts
│       │   ├── gen-codemod-fixed.mts
│       │   ├── gen-diff.mts
│       │   ├── gen-packages.mts
│       │   ├── get-package-dir-list.mts
│       │   ├── constants.mts            # libName/repo/license/configs/paths
│       │   └── utils/
│       │       ├── replace-with-no-match-check.mts        # the source repo's node-utils から移植
│       │       ├── compose-mono-type-fns.mts              # 同上
│       │       ├── replace-with-no-match-check-between-regexp.mts
│       │       ├── generate-key-value-record-from-keys.mts
│       │       ├── exit-if-err.mts
│       │       ├── wrap-start-end.mts
│       │       ├── format.mts
│       │       ├── clear-dir.mts                          # the reference monorepo の utils を取り込む
│       │       └── get-typescript-version.mts
│       ├── convert-dts/                 # 文字列置換ルール (the source repo ベース)
│       │   ├── common.mts
│       │   ├── constants.mts
│       │   ├── convert-main.mts
│       │   ├── convert-return-type-to-uint-range.mts
│       │   ├── dom-common.mts
│       │   └── lib.*.mts                # 多数
│       └── strategies/                  # lib 差し替え方式の戦略 (フェーズ 3/4 で拡張)
│           └── ts-4-5-to-5-x.mts
└── packages/
    └── v5.7/                            # name: "strict-ts-lib-v5.7-source" (private: true)
        ├── package.json
        ├── version-config.json          # typescriptVersion / libName / repo / license 等
        ├── tsconfig.lib-check.json           # 生成 lib を tsc@5.7 で検証 (dom flavor)
        ├── tsconfig.lib-check.webworker.json #   〃 (webworker flavor)
        ├── scripts/                     # scripts-common を呼ぶ薄い wrapper 群
        │   ├── gen.mts / gen-full.mts / gen-lib-files.mts / gen-packages.mts
        │   ├── gen-with-codemod-fixed.mts
        │   └── _options.mts             # packageRoot / version-config.json を渡す
        ├── temp/                        # 中間生成物 (gitignore)
        │   ├── copied/
        │   ├── copied-for-diff/
        │   └── codemod-fixed/
        ├── diff-from-prev/              # 隣接バージョン間の diff (gen:version-diff)
        ├── output/                      # 非 branded 生成物 (公開対象)
        │   ├── lib-files/               # 変換済み lib (フラット配置)
        │   ├── packages/                # 配布用 sub package 群
        │   │   ├── es5/                 # name: "strict-ts-lib-v5.7-es5"
        │   │   │   ├── package.json
        │   │   │   └── index.d.ts
        │   │   ├── es2015/collection/   # name: "strict-ts-lib-v5.7-es2015-collection"
        │   │   └── ...
        │   ├── diff/                    # 公式 lib との差分 (.diff)
        │   ├── package.json             # name: "strict-ts-lib-v5.7-output" (private: true)
        │   └── tsconfig.json
        └── output-branded/              # branded 生成物 (公開対象)
            ├── lib-files/
            ├── packages/                # name: "strict-ts-lib-v5.7-branded-es5" 等
            ├── diff/
            ├── package.json
            └── tsconfig.json
```

要点:

- `scripts-common` は workspace パッケージ。各 `packages/vX.Y` から `workspace:*` で参照する。
- `packages/vX.Y/package.json` は `private: true`。公開対象は `output*/packages/*/` 配下のみ。
- TS バージョン固有の override が必要になったら、`packages/vX.Y/version-config.json` と `scripts/_options.mts` から `scripts-common` の hook ポイント (関数引数 / オプション) に差し込む。フェーズ 1 では override 不要。
- `output*/` は git commit する (両参考実装と同じ運用)。

## 3. npm 公開命名規約

| 種別                | パッケージ名                                                                     |
| ------------------- | -------------------------------------------------------------------------------- |
| 非 branded・top lib | `strict-ts-lib-v5.7-es5`, `strict-ts-lib-v5.7-dom`, ...                          |
| 非 branded・sub lib | `strict-ts-lib-v5.7-es2015-core`, `strict-ts-lib-v5.7-dom-iterable`, ...         |
| branded             | `strict-ts-lib-v5.7-branded-es5`, `strict-ts-lib-v5.7-branded-dom-iterable`, ... |

- `version`: 通常の semver。例: `1.0.0`。the source repo の `5.7.2-strict-lib-v9` 方式は採らない (TS バージョンは名前で表現)。
- 各サブパッケージは `peerDependencies` を持つ:
    - `ts-type-forge`: `^N` (利用ライブラリのバージョンに従う)
    - `typescript`: 対応する TS バージョン範囲。例: v5.7 系 → `">=5.7.0 <5.8.0"`
- npm 規約: 内部にドットを含むパッケージ名は許容される (例: `socket.io`)。先頭が `.`/`_` の新規名は不可だが、`strict-ts-lib-v5.7-...` は問題なし。
- 利用者は package.json のエイリアス機能で `@typescript/lib-xxx` にマップする:

    ```json
    {
        "devDependencies": {
            "@typescript/lib-es5": "npm:strict-ts-lib-v5.7-es5@^1",
            "@typescript/lib-dom": "npm:strict-ts-lib-v5.7-dom@^1"
        }
    }
    ```

    branded 利用は `npm:strict-ts-lib-v5.7-branded-es5@^1` に差し替え。branded と非 branded の混在は非対応。

- パッケージ名生成ロジック (`gen-packages.mts` 内):

    ```ts
    const flat = packageRelativePath.replaceAll('/', '-');
    const name = `${libName}${config.useBrandedNumber ? '-branded' : ''}-${flat}`;
    // libName = "strict-ts-lib-v5.7", flat = "dom-iterable"
    //   → "strict-ts-lib-v5.7-dom-iterable"
    //   branded: "strict-ts-lib-v5.7-branded-dom-iterable"
    ```

    TypeScript コンパイラは `<reference lib="dom.iterable" />` を `@typescript/lib-dom-iterable` (ドットを `-` に置換) に解決するため、npm 名側にドットを含めなくても動作する。

## 4. ベース移植マッピング

the source repo/source/scripts/src/ → 当 repo scripts-common/src/ への移植時:

| the source repo 側                                                                                                                                          | 当 repo 側                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `the source repo's node-utils` の `replaceWithNoMatchCheck`, `composeMonoTypeFns`, `replaceWithNoMatchCheckBetweenRegexp`, `generateKeyValueRecordFromKeys` | `scripts-common/src/functions/utils/` に自前実装で取り込む (`node-utils.mts` 等)                                                                                                    |
| `constants.mts` の `libName = 'the source repo's strict lib'`                                                                                               | `libName = 'strict-ts-lib-v5.7'` (version-config から注入)                                                                                                                          |
| `repo = '.../the-private-source-repo.git'`                                                                                                                  | `repo = 'https://github.com/noshiro-pf/strict-typescript-lib.git'`                                                                                                                  |
| `license = 'ISC'`                                                                                                                                           | `license = 'Apache-2.0'`                                                                                                                                                            |
| `typeUtilsName = 'ts-type-forge'`, `typeUtilsGlobalName = 'ts-type-forge/global'`                                                                           | そのまま流用                                                                                                                                                                        |
| `configs: [{ useBrandedNumber: false, ... }]` (1 エントリ)                                                                                                  | the reference monorepo の 2 エントリ版を復活: 非 branded + branded                                                                                                                  |
| the source repo 追加の `lib.es2022.sharedmemory.mts`                                                                                                        | 採用 (the reference monorepo には無い)                                                                                                                                              |
| `package-root.mts` (`paths.strictTsLib` の起点)                                                                                                             | 各 `packages/vX.Y/scripts/_options.mts` が packageRoot と `version-config.json` を読み、`scripts-common` へ引数で渡す                                                               |
| the reference monorepo の `fmt-diff.mts`, `publish-packages.mts`, `clear-dir.mts`                                                                           | 取り込む                                                                                                                                                                            |
| the source repo の `gen-packages.mts` で `packageRelativePath.replaceAll('/', '-')`                                                                         | そのまま採用                                                                                                                                                                        |
| `gen-codemod-fixed.mts` の lib 変換                                                                                                                         | 型チェッカーを使わない自前の text-splice transform (`functions/codemod/transform-dts.mts`) で `any`→`unknown` と readonly 付与を実施。旧 ESLint fix / ts-codemod-lib より大幅に高速 |

`configs` を 2 エントリにすることで自動的に `output/` と `output-branded/` が並列生成される。

## 5. 共通生成パイプライン

the source repo の `gen-steps` をそのまま踏襲:

```text
1. fetchLibFiles               # gh api + wget で TS GitHub から取得 → temp/copied/
2. format temp/copied          # oxfmt
3. genCodemodFixed             # 自前 transform (transform-dts.mts) で any→unknown / readonly 付与 → temp/codemod-fixed/
4. genLibFiles                 # convert-dts の置換ルールを適用 → output*/lib-files/
5. format output/lib-files     # oxfmt
6. prepareCopiedForDiff        # 元 lib をコピーして diff 用に整える
7. genDiff                     # diff (output/lib-files vs copied-for-diff) → output/diff/
8. genPackages                 # output*/packages/*/{package.json,index.d.ts} 生成
9. format output*/packages     # oxfmt
10. pnpm install               # workspace 内 link を更新
```

各 step は引数で対象バージョンディレクトリ (`packages/v5.7`) を受け取り、その配下の `temp/`, `output/`, `output-branded/` に対して動作する。

## 6. 戦略パターン (フェーズ 3/4 を見据えた抽象化)

`scripts-common/src/strategies/` に lib 差し替え方式の戦略を分離。フェーズ 1 では `ts-4-5-to-5-x.mts` のみ実装。

```ts
// scripts-common/src/strategies/types.mts
export type LibReplacementStrategy = Readonly<{
    /** README 用の利用方法サンプル */
    generateReadmeUsage: (libName: string, packageVersion: string) => string;

    /** root package.json の devDependencies に書き込む @typescript/lib-* 群 */
    buildRootDeps: (
        libDirs: readonly string[],
        libName: string,
        packageVersion: string,
    ) => Record<`@typescript/lib-${string}`, string>;

    /** sub package.json に追加するフィールド (engines, files など) */
    augmentSubPackageJson?: (base: PackageJson, libDir: string) => PackageJson;
}>;
```

| TS 範囲     | 戦略概要                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| ≥4.5 & <6.0 | `@typescript/lib-xxx` のパッケージ自動解決。the reference source repos と同じ。                       |
| ≥6.0        | 仕様確定後にフェーズ 3 で追記。差し替えメカニズムが変わる場合は本戦略を分岐させる。                   |
| ≤4.4        | `@typescript/lib-xxx` 非対応。フェーズ 4 で `tsconfig.paths` / `typeRoots` 等の代替メカニズムを実装。 |

## 7. ルート tooling

ルート `package.json` の主要 scripts (抜粋):

```jsonc
{
    "scripts": {
        "check-all": "tsx ./scripts/cmd/check-all.mts",

        // 全バージョン一括生成 (各 packages/vX.Y の gen ステージを順に実行)
        "ws:gen": "tsx ./scripts/cmd/ws-gen-stages.mts",
        "ws:gen:full": "tsx ./scripts/cmd/ws-gen-full-stages.mts",
        "ws:gen:with-codemod-fixed": "tsx ./scripts/cmd/ws-gen-with-codemod-fixed-stages.mts",

        // 生成 lib の型チェック (各バージョンの type-check = tsc@5.x + libReplacement)
        "ws:type-check": "pnpm run --recursive --if-present type-check",

        // build tooling の型チェック (root の typescript で一括)
        "check:root": "pnpm run '/check:root:.*/'",
        "check:root:type": "tsc -p ./tsconfig.json --noEmit", // dogfood: v5.9 strict lib (libReplacement)
        "check:root:tooling": "tsc -p ./tsconfig.tooling.json --noEmit", // stock lib で全 build tooling

        "changeset:all": "tsx ./scripts/cmd/create-changeset.mts", // 全公開パッケージの changeset 一括生成

        "lint": "pnpm run z:eslint .", // 単一 root eslint.config.mts でリポジトリ全体
        "lint:fix": "pnpm run z:eslint . --fix",
        "fmt": "oxfmt --ignore-path=.gitignore --ignore-path=.oxfmtignore .",
        "cspell": "cspell \"**\" --gitignore --gitignore-root ./ --no-progress",
        "md": "markdownlint-cli2",
    },
}
```

型チェックは 3 系統に分かれる:

- **dogfood** (`tsconfig.json`, root typescript): `libReplacement: true` で v5.9 の生成 strict lib を読み、root 自身のコードを検証。
- **tooling** (`tsconfig.tooling.json`, root typescript): stock lib で root + `scripts-common` + 全 `packages/v*/scripts` を一括検証。ベース `configs/tsconfig/tsconfig.type-check.json` は `libReplacement: false` を既定にし、strict lib 置換は上記 dogfood と各 lib-check のみで有効化する。
- **lib-check** (各 `packages/vX.Y/tsconfig.lib-check{,.webworker}.json`, その版の tsc@5.x): 自バージョンの生成物を `@typescript/lib-*` として link し `skipLibCheck: false` で lib 自体を検証。

ESLint 設定は root の `eslint.config.mts` 1 つに集約し、per-package の `eslint.config.mts` / `tsconfig.json` は持たない (typed-lint は `tsconfig.tooling.json` を project に使う)。

各 `packages/vX.Y/package.json` (例: v5.7):

```jsonc
{
    "name": "strict-ts-lib-v5.7-source",
    "private": true,
    "type": "module",
    "scripts": {
        // scripts/*.mts は scripts-common の command を呼ぶ薄い wrapper
        "gen": "tsx ./scripts/gen.mts",
        "gen:full": "tsx ./scripts/gen-full.mts",
        "gen:packages": "tsx ./scripts/gen-packages.mts",
        "gen:lib-files": "tsx ./scripts/gen-lib-files.mts",
        "gen:with-codemod-fixed": "tsx ./scripts/gen-with-codemod-fixed.mts",
        // 生成 lib を tsc@5.7 + libReplacement + skipLibCheck:false で検証
        "type-check": "tsc -p tsconfig.lib-check.json && tsc -p tsconfig.lib-check.webworker.json",
    },
    "dependencies": {
        "strict-ts-lib-scripts-common": "workspace:*",
    },
    "devDependencies": {
        // 自バージョンの生成物を @typescript/lib-* として link (libReplacement 用)
        "@typescript/lib-es5": "file:output/packages/es5",
        "@typescript/lib-dom": "file:output/packages/dom",
        // ... 生成された全 lib パッケージ分
        "typescript": "5.7.2",
        "ts-type-forge": "...",
        "ts-data-forge": "...",
        "ts-repo-utils": "...",
    },
}
```

## 8. check-all

`scripts/cmd/check-all.mts` のステップ:

1. `pnpm i`
2. `pnpm run cspell`
3. `pnpm run md`
4. `pnpm run check:root` — build tooling の型チェック (dogfood + tooling)
5. `pnpm run ws:gen:with-codemod-fixed` — 全バージョンの生成
6. `pnpm run ws:type-check` — 生成 lib を各バージョンの tsc@5.x で検証
7. `pnpm run lint:fix` — 単一 config でリポジトリ全体を lint
8. `pnpm run fmt` — oxfmt (差分が出ないこと)

## 9. CI / 公開

- CI: `pnpm check-all` を実行することで「生成 + 型チェック + 各種 lint」を 1 コマンドで検証。
- 公開: [Changesets](https://github.com/changesets/changesets) を導入し、`output*/packages/*/` の各サブパッケージを npmjs.com に publish。バージョンは TS バージョンごとに独立して semver で運用。
- フェーズ 1 では publish CI 自体は導入せず、Changesets の `init` のみ済ませる。手動 publish は the reference monorepo 由来の `scripts-common/src/commands/publish-packages.mts` を流用。

## 10. 実装ロードマップ

| フェーズ | スコープ                                                                                                                            | 状態   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **1**    | scaffold 撤去 → モノレポ化 / `scripts-common` & `packages/v5.7` を the source repo から移植 / branded configs 復活 / check-all 通過 | 着手中 |
| **2**    | `packages/v5.8` 以降を増やす。convert-dts に version 差分が出たら hook point を切る。                                               | 未着手 |
| **3**    | `strategies/ts-6-x.mts` 追加。v6.x の lib 差し替えメカニズムに合わせて gen-packages / 利用ドキュメントを分岐。                      | 未着手 |
| **4**    | `strategies/ts-le-4-4.mts` 追加。`@typescript/lib-xxx` 非対応時代向け代替メカニズム。                                               | 未着手 |

## 11. 当面のスコープ外

- v5.8 以上、v6 以上、v4.4 以下の対応 (フェーズ 2 以降)
- 公開用 CI (publish workflow) の自動化 (Changesets 初期化のみ実施し、publish は手動から)
- README の利用者向けドキュメント整備 (フェーズ 1 後半か、初回 publish 時点で着手)
