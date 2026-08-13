# `strict-typescript-lib` を mono に統合するか

## 結論（提案）

**統合しない。** 代わりに、統合したい理由として挙がっていた 2 点をそれぞれ別の手段で解決する。

- ワークフローの重複 → mono 側に再利用可能ワークフロー（`on: workflow_call`）を置き、`strict-typescript-lib` から呼ぶ
- 型定義変更の即時検証 → mono が strict lib を**導入**する際に、開発時だけローカルチェックアウトを向く仕組みを用意する

統合を避ける決め手は、フォーマッタの違いではなく**配布経路**にある。詳細は後述。

## 2 つのリポジトリの規模

|                                     |                    `mono` |          `strict-typescript-lib` |
| :---------------------------------- | ------------------------: | -------------------------------: |
| 追跡ファイル                        |                     7,951 |                            8,972 |
| うち生成物（`packages/v*/output*`） |                         — |                     6,907（77%） |
| コミット                            |                     5,026 |                              106 |
| タグ                                |                       555 |                               14 |
| GitHub Release                      |                       550 |                               11 |
| Release あたりのアセット            |                         0 |                           約 200 |
| ワークスペースプロジェクト          | 17（すべて publish 対象） | 33（**すべて `private: true`**） |
| `.git`                              |                      69MB |                             24MB |

`strict-typescript-lib` の中身は、手で書かれた 80 ファイル程度のスクリプトと、そこから生成される 6,907 ファイルの型定義でできている。TypeScript のマイナーバージョンごとに `packages/v5.0` … `packages/v6.0` の 12 系統があり、各系統が `output/`（通常）と `output-branded/`（branded number 版）を持つ。

## 統合したい理由の検証

### 1. CLAUDE.md や workflow の一元管理

**現状の重複は実在する。** 両リポジトリのワークフローは同じ 8 本で、内訳は次のとおり。

| ワークフロー                     | 差分     |
| :------------------------------- | :------- |
| `lint-pull-request.yml`          | 完全一致 |
| `sync-agent-config.yml`          | 完全一致 |
| `backup-repository-settings.yml` | 1 行     |
| `release.yml`                    | 17 行    |
| `node-version-compatibility.yml` | 18 行    |
| `style-check.yml`                | 21 行    |
| `type-check.yml`                 | 44 行    |
| `pnpm-update.yml`                | 48 行    |

`CLAUDE.md` は完全一致。`agents/common-rules.md` は**既に差分がある** — `sync-agent-config` workflow が `common-agent-config` リポジトリから vendoring する仕組みがあるのに、同期が追いついていない状態。

つまりエージェント設定については**一元管理の仕組みは既にあり**、統合しなくても解決する問題（同期の遅れ）だった。残るワークフロー本体の重複は、GitHub の再利用可能ワークフローで解ける。統合はこの目的には過剰。

### 2. 型定義の変更の影響をすぐにテストできる

これは統合の**正当な利点**で、他の手段では完全には代替できない。ただし前提として、mono 側がまだ strict lib を導入していない（step 2 の未着手項目）。

導入後であれば、開発時に `@typescript/lib-*` の解決先をローカルチェックアウトへ向けるだけで同じ効果が得られる。strict lib 側は既に全 lib を生成しているので、生成物のディレクトリを指す指定を書き出すスクリプトを足せばよい。統合しなければ得られない、というほどの差ではない。

## 統合を避ける理由

### A. 配布経路が根本的に違う（決め手）

`strict-typescript-lib` は **npm に何も publish していない**。33 のワークスペースプロジェクトはすべて `private: true` で、成果物は **GitHub Release のアセット（tarball）** として配られる。

```sh
npm install -D https://github.com/noshiro-pf/strict-typescript-lib/releases/download/dist-v5.9-<version>/strict-ts-lib-v5.9-<version>.tgz
```

ここから 2 つの帰結が出る。

**A-1. 利用者のインストール URL にリポジトリ名が埋まっている。**
統合すると、以降の URL はすべて `…/noshiro-pf/mono/releases/download/…` になる。既存の固定 URL は旧リポジトリを archive して残す限り生き続けるが、README・リリースノート内の貼り付け用ブロック・利用者の `package.json` がすべて世代で分断される。9 リポジトリ統合のときと同じ痛みを、**npm の抽象化なしに**もう一度払うことになる。

**A-2. Releases 一覧が両立しない。**
mono の Releases は changesets が発行する npm パッケージのチェンジログで、たった今 550 件すべてを `<package>@<version>` に揃えたばかり。strict lib は 1 リリースあたり約 200 個のアセットを持ち、TypeScript バージョン 1 つにつき 1 リリース、1 回の publish で最大 12 リリースが増える。

同居させると:

- mono の Releases 一覧は数回の publish でリリース種別が混在し、`Latest` も lib の dist リリースに奪われる
- タグの命名規則も `<package>@<version>` と `dist-vX.Y-<version>` の 2 系統になる
- リリースワークフローも 2 系統（changesets と `dist-github-release.mts`）になる

これは「ノイズだらけになる**可能性**」ではなく、確定的にそうなる。

### B. ディレクトリ規約が合わない

mono の `libs/*` は「1 ディレクトリ = 1 npm パッケージ」。統合を優先して確定した規約で、9 リポジトリのうち入れ子モノレポだった 4 つはこれに合わせて平坦化した。

`strict-typescript-lib` の `packages/v5.9/output/packages/es5` のような 4 階層の構造はこの規約に入らない。`libs/` にも `apps/` にも `tools/` にも該当せず、新しいトップレベル区画を作ることになる。

### C. 生成物 6,907 ファイルが mono の作業ツリーに載る

追跡ファイル数が 7,951 → 16,923 に増える（+113%）。しかも 6,907 は生成物で、TypeScript のバージョンが上がるたびに全面的に書き換わる。mono 側の PR レビュー・`git grep`・エディタのインデックスすべてに影響する。

`.gitignore` して CI で生成する手はあるが、現在は差分をレビューするために追跡している。統合のためにその運用を変えるのは本末転倒。

### D. フォーマッタの違い

`strict-typescript-lib` は `oxfmt`、mono は `prettier` + `prettier-plugin-organize-imports` + `prettier-plugin-packagejson`。

|                     | mono (`.prettierrc`)               | strict-typescript-lib (`.oxfmtrc.json`) |
| :------------------ | :--------------------------------- | :-------------------------------------- |
| `printWidth`        | 既定（80）                         | 80                                      |
| import 整列         | `prettier-plugin-organize-imports` | `sortImports`                           |
| package.json 整列   | `prettier-plugin-packagejson`      | `sortPackageJson`                       |
| Markdown `tabWidth` | 4                                  | 対象外                                  |

出力そのものは近いので、ディレクトリごとにフォーマッタを分ける運用は技術的には可能。ただし `fmt:full` / `style-check` / `assert-repo-is-clean` がすべて分岐を持つことになる。

**これは統合を避ける理由としては A〜C より弱い。** 仮に A〜C が解決しても D だけなら統合できる、という程度の問題。mono には既に oxfmt 移行の draft PR（[#1549](https://github.com/noshiro-pf/mono/pull/1549)）があり、mono 側が oxfmt に寄れば差は消える。

## 統合しない場合にやること

### 1. ワークフローの重複を再利用可能ワークフローで解消する

mono に `.github/workflows/*.yml` を `on: workflow_call` 付きで置き、`strict-typescript-lib` 側は呼び出すだけにする。

```yaml
# strict-typescript-lib/.github/workflows/style-check.yml
jobs:
    style-check:
        uses: noshiro-pf/mono/.github/workflows/style-check-reusable.yml@main
        with:
            formatter: oxfmt
```

差分が大きい `type-check.yml`（44 行）と `pnpm-update.yml`（48 行）は、差分の中身を見てから入力パラメータに落とすか、共通化を諦めるかを決める。完全一致の 2 本と 1 行差の 1 本は即座に共通化できる。

### 2. `agents/common-rules.md` の同期ずれを直す

仕組みは既にある。`sync-agent-config` workflow を両リポジトリで走らせて追いつかせる。

> **追記（2026-08-12）**: mono 側はこの案を採らなかった。9 リポジトリが 1 つに
> なった時点で mono の中に共有相手が居なくなったため、vendoring をやめて
> `agents/` を root の `AGENTS.md` へ畳み、`sync-agent-config` workflow と生成
> スクリプトを削除した。`common-agent-config` は strict-typescript-lib など他の
> リポジトリのために存続するが、mono はもう追従しない。

### 3. mono への strict lib 導入時に、ローカル解決の口を用意する

step 2 の「`strict-typescript-lib` を導入」を進めるときに、`@typescript/lib-*` の指定を「リリース URL」と「ローカルチェックアウトの生成物ディレクトリ」で切り替えられるようにする。これで型定義変更の即時検証という利点は回収できる。

## 統合が正しくなる条件

将来この判断を見直すとしたら、次のいずれかが起きたとき。

- `strict-typescript-lib` が npm publish に移行する（A-1 と A-2 が同時に消える）
- 生成物を追跡しない運用に変わる（C が消える）
- mono が oxfmt に移行する（D が消える）
- ワークフローの共通化を試して、再利用可能ワークフローでは吸収しきれないと分かる（統合の動機が強まる）

現時点で満たしているものはない。

## 導入の前提（2026-08-13 調査、同日解消）

step 2 の「`strict-typescript-lib` を導入する」に着手して、着手できないことが分かった。
**mono の型チェックを担っているコンパイラ向けのビルドが存在しない。**

### 配布物の形

まず仕組みを確認した。配布されるのは `@typescript/lib-*` を差し替える形で、
TypeScript の `libReplacement` に乗る。

```jsonc
// strict-ts-lib-v6.0 の package.json（抜粋）
{
    "dependencies": {
        "@typescript/lib-es5": "https://github.com/.../strict-ts-lib-v6.0-es5-0.0.0.tgz",
        "@typescript/lib-esnext": "https://github.com/.../strict-ts-lib-v6.0-esnext-0.0.0.tgz",
        // …計 100 以上
    },
    "peerDependencies": { "typescript": ">=6.0.0 <6.1.0" },
}
```

個々の lib パッケージは `types: "./index.d.ts"` を持つだけの型定義パッケージで、
`ts-type-forge@^7` に依存する（`parseInt` の `radix` が `UintRange<2, 37>` になる、
といった記述のため）。

### 何が足りないか

|                                      |                                                                         |
| :----------------------------------- | :---------------------------------------------------------------------- |
| `strict-typescript-lib` の最新ビルド | `dist-v6.0-0.0.0`（2026-07-28）。**v7.0 は無い**                        |
| その peer range                      | `typescript >=6.0.0 <6.1.0`                                             |
| mono の型チェック                    | 18 プロジェクト中 17 が `typescript-native`（= `npm:typescript@7.0.2`） |
| 残る 1 つ                            | `apps/synstate-docs` のみ `tsc`（`typescript` 6.0.3）                   |

つまり調査時点では、リポジトリのゲートを通しているコンパイラは TypeScript 7 なのに、
strict lib は TypeScript 6.0 系にしか対応していなかった。

**同日中に `dist-v7.0-0.0.0` が出て解消した。** peer range は
`typescript >=7.0.0 <7.1.0` で、mono の `typescript-native`（`npm:typescript@7.0.2`）
と一致する。メタパッケージ `strict-ts-lib-v7.0` は 107 個の `@typescript/lib-*` を
dependencies に持ち、README の指示は「これを devDependency に入れれば TypeScript が
自動的に拾う」というもの。

### 出せるようになったときのために

- 参照の切り替え先（リリース URL ↔ ローカルチェックアウト）は、依存指定が tarball の
  URL なので `pnpm-workspace.yaml` の `overrides` で `@typescript/lib-*` を
  ローカルパスへ向けるのが素直。パッケージごとに書く必要は無い
- `typescript` は `update.ignoreDeps` に入っているため、pnpm-update が勝手に
  マイナーを上げて peer range から外れる心配は無い
- 導入の影響範囲は事前に測っておくとよい。strict lib は `Array.prototype.at` などの
  戻り値を厳しくするので、17 パッケージ分の型エラーが一度に出る種類の変更になる

## 導入手順（2026-08-14 実測）

v7.0 が出たので実際に入れて測った。**導入は可能だが、1 つの PR では収まらない。**

### 分かった前提 3 つ

**1. `libReplacement` は TypeScript 7 では既定 `false`。** strict lib の README は「4.5
以降は自動で拾う」と書いているが、v7 には当てはまらない。無指定だと
`@typescript/lib-*` を一度も探さない（`--traceResolution` で 0 件）。
`tools/configs/tsconfig/tsconfig.type-check.json` に `"libReplacement": true` を
足して初めて効く。

**2. メタパッケージ 1 つでは足りない。** `strict-ts-lib-v7.0` の依存 107 個はすべて
GitHub Release の URL で、pnpm 11 は既定でこれを拒否する。

```text
[ERR_PNPM_EXOTIC_SUBDEP] Exotic dependency "@typescript/lib-es2015-proxy"
(resolved via url) is not allowed in subdependencies when blockExoticSubdeps is enabled
```

`blockExoticSubdeps: false` で回避できるが、**リポジトリ全体で URL 依存の禁止を
解く**ことになる。`pnpm update` の PR は auto-merge されるので、無審査で URL 依存が
入る経路ができる。107 個を root に直接宣言すれば防御は維持できる（実測で
`node_modules/@typescript` に 107 個が並び、置き換えが効くことを確認した）。

**3. `@typescript/lib-*` は誰も import しないので knip が unused と報告する。**
理由付きで `ignoreDependencies` に入れる必要がある。

### エラーの数え方に注意

素朴に全パッケージで型チェックすると 21,629 件出るが、**大半はビルド失敗の連鎖**。
`ts-data-forge` が strict lib で 11 件落ちる → `.d.mts` が生成されない → 依存側が
生の `.mjs` を型チェックして implicit any が数千件、という形。実際の指摘は各
パッケージ十数件規模。

### 進め方

**依存のトポロジカル順に、1 パッケージずつ opt-in する。** `libReplacement` は共有
tsconfig ではなく各パッケージの tsconfig に入れ、そのパッケージのエラーを直して
から次へ進む。全部通ったところで共有 tsconfig へ移す。

1 本目の PR は**土台だけ**にした。107 個の依存宣言と knip の ignore で、
`libReplacement` はどこでも有効にしていない。入れただけでは何も変わらないので CI は
緑のまま入り、以降の PR が 1 パッケージずつ opt-in できる。

2 本目以降は 1 パッケージ 1 PR。`ts-data-forge` の 11 件が最初になる。

`ts-data-forge` の 11 件は `Object.keys` の戻り、`setTimeout` の引数、`Map` を
継承したクラスの静的側など、いずれも strict lib の狙いどおりの指摘で、キャストで
潰さずに直す必要がある。

### パッケージごとの件数（2026-08-14 実測）

ビルドが通っている状態で 1 パッケージずつ有効にして数えた。連鎖を含まない実数。

| パッケージ           | 件数 | 状態                               |
| :------------------- | ---: | :--------------------------------- |
| `octokit-safe-types` |    0 | **opt-in 済み**                    |
| `ts-repo-utils`      |    2 | 公開型の変更を伴う。後述           |
| `ts-fortress`        |    4 | 未着手                             |
| `ts-type-forge`      |    6 | 未着手                             |
| `ts-data-forge`      |   11 | 9 件対応済み、2 件が外部要因で保留 |

`ts-repo-utils` の 2 件は、strict lib の `Object.fromEntries` が `Partial<...>` を
返すこと（entries が key の union を網羅しているとは限らないため。正しい厳しさ）と、
`String.prototype.replaceAll` のコールバックのキャプチャ群が `unknown` になること。
前者は `Package['dependencies']` の型を実態に合わせる話になり、**公開型が変わる**ので
changeset が要る。

### opt-in のたびに確認すること

`.d.mts` が変わらないこと。`libReplacement` の有無で 2 通り emit して突き合わせる。
`octokit-safe-types` では 15 ファイルすべて同一だった。
