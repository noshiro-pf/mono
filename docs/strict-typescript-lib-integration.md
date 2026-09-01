<!-- cspell:ignore ENOENT iset -->

# `strict-typescript-lib` を mono に統合するか

## 結論

**統合する（2026-08-22 決定）。** 2026-08-13 時点の結論は「統合しない」だった。決め手は
フォーマッタの違いではなく**配布経路** — npm に何も publish しておらず、GitHub Release の
URL が利用者の唯一のインストール手段だったこと — で、**その前提が失効した**。

反転させたのは 3 つの出来事である。

| #   | 何が起きたか                                                                         | 何が変わったか                                                                       |
| :-- | :----------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| 1   | per-lib 分割をやめ、1 系統 1 パッケージに集約（strict-typescript-lib#123）           | publish 数が約 2,400 → 24。npm のレート制限を踏まなくなった                          |
| 2   | 全 24 パッケージを npm に publish し trusted publishing を設定（#125 / #127 / #129） | **正の配布経路が URL から npm に移った**。「URL にリポジトリ名が埋まる」問題が消えた |
| 3   | mono 側が URL 依存をやめ `paths` 1 行で解決する形に（mono#1656）                     | 消費側の設定が `blockExoticSubdeps` 込みの 2 設定から `paths` 1 行になった           |

以下は当時の調査記録である。節ごとに現在の扱いを注記した。**実際の移行手順は末尾の
「移行方針（2026-08-22 決定）」にある。**

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

> **この節は 2026-08-13 時点の記録である。** 現在の扱いは次のとおり。
>
> | 理由                                            | 当時   | 現在                                                                   |
> | :---------------------------------------------- | :----- | :--------------------------------------------------------------------- |
> | **A-1** インストール URL にリポジトリ名が埋まる | 決め手 | **失効**。正の入口は npm になった                                      |
> | **A-2** Releases 一覧とタグが混在する           | 決め手 | **設計で解く**。GitHub Release は廃止、タグは後述                      |
> | **B** ディレクトリ規約が合わない                | 中     | **受け入れる**。`libs/` ではなく `strict-lib/` を新設する              |
> | **C** 生成物がツリーに載る                      | 中     | **縮めてから移す**。死んだ生成物が 2,000 件以上ある（後述）            |
> | **D** フォーマッタの違い                        | 弱     | **住み分ける**。`strict-lib/` を prettier の対象外にし、そこだけ oxfmt |

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

> **追記（2026-08-21）**: この「1 つでは足りない」は**半分だけ正しかった**。
> `blockExoticSubdeps` の他にもう 1 つ設定が要り、それを入れればメタパッケージ 1 件
> で足りる。防御は pnpm ではなくロックファイル側の自前チェックで維持する。
> 「依存宣言を 1 件にまとめる」の節を参照。

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
changeset が要る。**ただしこの判断は後述の strict-typescript-lib#117 より前のもの。**
2026-08-20 に測り直した結果は「繰り返し出るパターン」の節に書いた。

### opt-in のたびに確認すること

`.d.mts` が変わらないこと。`libReplacement` の有無で 2 通り emit して突き合わせる。
`octokit-safe-types` では 15 ファイルすべて同一だった。

**lint は `ws:lint` ではなく `ws:lint:fix` + `z:assert-repo-is-clean` で測る。**
strict lib が緩くした指摘に付いていた `eslint-disable` は不要になるが、
`reportUnusedDisableDirectives` の重大度は warning なので `ws:lint` は exit 0 の
まま「0 件」と報告する。CI の `type-check (ws:lint:fix)` は `--fix` でそれを消し、
そのあとの clean 判定で落ちる。#1761 の `eslint-config-typed` がこれで、18 件が
`ws:lint` を通り抜けた。

### 型チェック以外への影響（2026-08-14 実測）

`ts-fortress` で opt-in を試して分かった。**導入コストは型エラーの件数では測れない。**

**1. strict lib の `@deprecated` が lint エラーになる。** strict lib は `String`
コンストラクタなどに `@deprecated` を付けており、`@typescript-eslint/no-deprecated`
がこれを拾う。

```text
/** @deprecated Don't use String constructor */
(value?: unknown): string;
```

`ts-fortress` では型エラー 4 件を直したあとに **lint が 21 件**残った（opt-in 前は
0 件）。パッケージごとの見積りには lint の件数も要る。

**2. `lint:fix` が strict lib 前提のコードに書き換える。** `key-value-record.mts`
では、strict lib 下で不要になった型アサーションと `eslint-disable` を `lint:fix` が
自動削除した。strict lib 下では正しいが、**標準 lib に戻すと型エラーになる**。

```text
標準 lib: src/record/key-value-record.mts(99,5): error TS2322
```

`src` を配るパッケージでは、これが**消費者のエディタに赤として現れる**。`expectType`
のときは自分で書き換えを止められたが、`lint:fix` は自動なので止められない。

**したがって `src` を配るパッケージの opt-in には、次のどれかの方針決定が要る。**

- `files` から `src` を外す（Go to Definition が dist に飛ぶようになる）
- `no-deprecated` を strict lib 由来のものに限って緩める
- 消費者のエディタに赤が出ることを受け入れる

**2026-08-15、3 つ目に決まった。** 消費者の環境で `src` に赤が出ることは許容する。
このリポジトリは `@typescript-eslint/explicit-function-return-type` で関数の入出力に
型注釈を強制しているため、推論に委ねられている箇所が少なく、lib の違いが波及する
範囲がそもそも狭い。上の 2 つは、それぞれ Go to Definition の価値と lint の一貫性を
失う代わりに得るものが小さい。

この決定で、opt-in を止めていた条件は無くなった。以降のパッケージは
`no-deprecated` の件数だけを見て進めてよい。

`ts-type-forge` のように `files` が `["dist", …]` のパッケージにはこの制約が無い。

### 繰り返し出るパターン: `Object.fromEntries` が `Partial` を返す

strict lib の `Object.fromEntries` は `Partial<...>` を返す。entries が key の union
を網羅している保証が無いためで、指摘としては正しい。ただし「key が元の record から
来ている」ケースでは常に網羅しているので、実害のない不一致になる。

`ts-fortress` の 4 件はすべてこれで、`ts-repo-utils` にも 1 件ある。

**2026-08-20 追記: この見立ては半分外れていた。** index signature の record
（`Record<string, V>`）に `Partial` が付いていたのは strict lib 側のバグで、修正済み。
リテラルキーの record に付くほうは正しい挙動で、変わらない。直し方も変わった。当時の
結論は「`fromEntries` をやめて `mut_` 変数と for ループで明示的に組み立てる」だったが、
いまは `ts-data-forge` の record 用ユーティリティを使う。以下 2 節が現在の内容。

#### 半分は strict lib 側のバグだった

`ToObjectKeys` / `ToObjectEntries` は、リテラルの union を「補完を残したまま任意の
文字列も受け付ける」形に開くための `string & {}` を、**キーの種類にかかわらず**
足していた。既に `string` を含むキー型に足すと `string | (string & {})` になる。
これは意味としては単なる `string` だが、`Object.fromEntries` の
`PartialIfKeyIsUnion` から見ると **union** なので、`Record<string, V>` にまで
`Partial` が付いていた。つまり「entries が網羅している保証が無い」ではなく、
網羅すべきキーが最初から 1 つも無い record にまで誤爆していた。

[strict-typescript-lib#117](https://github.com/noshiro-pf/strict-typescript-lib/pull/117)
で、この arm を「実際に広がるときだけ」足すようにした（`WithOpenString`）。
`PartialIfKeyIsUnion` 自体は変更していない。

| entries の元            | 修正前         | 修正後              |
| :---------------------- | :------------- | :------------------ |
| `Record<string, V>`     | `Partial<...>` | 総 (total)          |
| `{ a: 1; b: 2 }`        | `Partial<...>` | `Partial<...>` 維持 |
| `Record<'a' \| 'b', V>` | `Partial<...>` | `Partial<...>` 維持 |

**mono にはまだ届いていない。** root の 107 個の URL は `dist-v7.0-0.0.0`
（2026-08-13 公開）を指しており、#117 はそれより後。新しい `dist-v7.0-*` が出て
URL を貼り替えるまでは、この誤爆は従来どおり出る。

#### 残り半分は lib 側では直せないので、record 用の変換を足した

`Object.fromEntries(Object.entries(record).map(...))` は、標準 lib でも strict lib
でも「その entries が元の record を今も表している」という情報を型に残せない。返り値型
は要素型からしか組み立てられないので、リテラルキーの record が `Partial` になるのは
正しく、lib 側では直しようがない。entries 配列を経由するのをやめるしかない。

そこで record 用の変換を `ts-data-forge` に足した。いずれも `keyof R` に対する mapped
type を直接書くことで不変条件を型で表明する。**標準 lib でも strict lib でも同じ
ように通る**ので、opt-in を待たずに使える。

| 追加            | 用途                                         | 版     | PR                                                    |
| :-------------- | :------------------------------------------- | :----- | :---------------------------------------------------- |
| `Obj.map`       | 値だけ書き換える（キー集合は不変）           | 14.3.0 | [#1638](https://github.com/noshiro-pf/mono/pull/1638) |
| `Obj.filter`    | エントリを落とす。型ガードなら値型も絞る     | 14.4.0 | [#1642](https://github.com/noshiro-pf/mono/pull/1642) |
| `Obj.filterMap` | 変換と除去を同時に（除去は `Optional.none`） | 14.4.0 | [#1642](https://github.com/noshiro-pf/mono/pull/1642) |

```ts
// 旧: entries 配列を経由するので Partial<...> になる
const partialShape = Object.fromEntries(
    Object.entries(shape).map(
        ([k, v]) => [k, keysToBeOptional.has(k) ? optional(v) : v] as const,
    ),
);

// 新: キー集合が変わらないことが型に出る
const partialShape = Obj.map(shape, (v, k) =>
    keysToBeOptional.has(k) ? optional(v) : v,
);
```

`Obj.filter` / `Obj.filterMap` は index signature の record を**総のまま**返す。網羅
すべき具体的なキーが無く、`noUncheckedIndexedAccess` により添字アクセスの時点で
`undefined` が付くので、`Partial` を付けても情報は増えず、元の record 型に代入し直せ
なくなるだけだからである。この判断は #117 が strict lib 側で採った判断と同じ。

このレポートが数えた箇所のうち、entries 配列を経由していたものは #1642 で移行済み。

| ファイル                                     | 変更                                                      |
| :------------------------------------------- | :-------------------------------------------------------- |
| `ts-repo-utils` `get-workspace-packages.mts` | 手書きのタプル型ガードごと `Obj.filter(obj, isString)` に |
| `ts-fortress` `record/key-value-record.mts`  | `fill` → `Obj.filter`、`prune` → `Obj.filterMap`          |
| `ts-fortress` `record/record.mts`            | `prune` の `flatMap` → `Obj.filterMap`                    |
| `ts-fortress` `compose/intersection.mts`     | `mergePruned` を `Obj.map` / `Obj.filter` に              |
| `tools/scripts/cmd/gen-dependency-graph.mts` | `stringRecord` が 8 行 → 2 行                             |

上のコード例に出した `ts-fortress` の `record/partial.mts` にはまだ旧い形が残って
いる。`Obj.map` に置き換えられる形だが、#1642 では触っていない。

#### `ts-repo-utils` の 2 件を測り直した（2026-08-20 実測）

`libReplacement` を一時的に有効にして型チェックした。`dist-v7.0-0.0.0`（#117 前）の
ままなので、件数は 2 件で変わっていない。

```text
scripts/cmd/sync-cli-versions.mts(66,9): error TS2769: No overload matches this call.
src/functions/workspace-utils/get-workspace-packages.mts(84,11): error TS2322: Type
'{ …; dependencies: Partial<MutableRecord<string | (string & {}), string>>; }[]'
is not assignable to type 'readonly Readonly<{ …; dependencies:
ReadonlyRecord<string, string>; }>[]'.
```

後者の型に `string | (string & {})` がそのまま出ている。これが #117 で消す arm で、
key が素の `string` になれば union ではなくなり、`Partial` も付かない。**つまりこの
1 件は `Package['dependencies']` の公開型を変えなくても消える。** 前掲の「公開型が
変わるので changeset が要る」は #117 前の判断である。

**`dist-v7.0-0.1.0`（2026-08-20）で実際にそうなった。** 測り直したところ、
`Object.fromEntries` をそのまま書いても通る。したがってこの 1 件のために書いていた
回避は不要になり、下の節のとおり素直な形に戻した。

なお `dependencies` を組み立てているこの `Object.fromEntries` は、#1642 で移行した
`getKeyValueRecordFromJsonValue` とは**別の呼び出し**である（複数フィールドの record を
1 つにまとめている箇所）。`Obj.merge` は候補にならなかった。あちらは静的に長さの分かる
タプルを受ける可変長引数で、返り値も `MergeAll<Records>` という「どの record が来たか」に
依存した型である。ここでまとめるのは `dependencyFields` の長さぶんの**実行時に決まる配列**
なので、その形に乗らない。加えて `Obj.merge` 自身も内部は `Object.fromEntries` + `as never`
なので、`Partial` が消えるのは表明を図書館側に移したからにすぎない。**lib 側が直った今は
どちらも要らず、`Object.fromEntries` をそのまま書けばよい。**

**見積り全体について。** entries 配列を経由する書き方は、このように opt-in を待たずに
潰せるものと、lib 側の修正待ちのものが混ざる。パッケージごとの件数は opt-in の直前に
測り直す必要がある。残る課題として重いのは lint 21 件の方針決定（前節）のほう。

### `ts-data-forge` で分かったこと（2026-08-14）

最初の 1 パッケージとして着手し、**11 件のうち 9 件は直せたが 2 件は外部要因で止まった。**

**配布物には影響しない、ただし条件つき。** 標準 lib と strict lib で emit した
`.d.mts` 181 ファイルはバイト単位で同一だった。これは `libReplacement` の性質では
なく、**このリポジトリが `@typescript-eslint/explicit-function-return-type` を
強制していること**に支えられている。戻り値型を推論に任せると漏れる。

```ts
export const keysInferred = (o: UnknownRecord) => Object.keys(o);
// 標準: (o: UnknownRecord) => string[]
// strict: (o: UnknownRecord) => StrictLibInternals.ToObjectKeys<UnknownRecord>[]
```

漏れる `StrictLibInternals` は**消費者の環境に存在しない名前**なので、宣言が解決
不能になる。関数以外の export（`export const ks = Object.keys(rec)`）は lint 規約の
対象外なので、規約を守っていても漏れ得る。**パッケージごとの opt-in では毎回
`.d.mts` の差分がゼロであることを確認する。**

**`src` は配布物なので、lib の形に依存する記述を書けない。** `files` が `src` を
含む（Go to Definition が元ソースに飛ぶため）ので、strict lib でしか成立しない
`expectType` や `@ts-expect-error` を書くと、**消費者がエディタでソースを開いたとき
に赤が出る**。実測で 4 件出た。したがって:

- lib の形を固定する `expectType` は書かない（コメントとして残す）
- `@ts-expect-error` は使わない。抑制が不要な側で「未使用」エラーになるため

この 2 つは**当時の制約であって、現在の方針ではない**。前掲の「方針決定が要る」は
その後「消費者のエディタに赤が出ることを受け入れる」に決着している。コメントとして
残した `expectType` は strict lib の形に書き戻してよい。このブランチはそれをせず、
どちらの lib でも同じに読める形のまま置いてある — 書き戻す必要が無いなら、
そちらのほうが良い状態だからである。

**止まっている 2 件。**

1. **`class X extends Map` / `extends Set` が strict lib で通らない。** `MapConstructor`
   の `prototype` が `Map<never, never>` になっており、どんな部分クラスの prototype も
   代入不可。generics を外しても匿名クラスでも同じ。ごく普通の JavaScript が書けない
   ので、**strict lib 側の不具合として直すのが筋**
2. **`@eslint/plugin-kit` が strict lib で落ちる。** `dist/cjs/types.cts` は `.d.cts`
   ではなく**ソース**として配られているため `skipLibCheck` が効かない。
   `eslint-config-typed` を `paths` で source 解決していることで入ってくる

**2026-08-21 追記: 1 は片付いた。** `dist-v7.0-0.1.0` で `class X extends Map` /
`extends Set` が通るようになった。その状態で `libReplacement` を有効にして測り直すと、
**残る型エラーは 2 の 1 件だけ**である。

2 のほうは動いていない。`@eslint/plugin-kit` は 0.7.2 が最新のままで、
`dist/cjs/types.cts` はソースのまま配られている。**`paths` を dist に向けても消えない**
ことを実測した — `skipLibCheck` が飛ばすのは `.d.ts` であって、`.cts` はどう辿り着いても
ソースとして型検査されるためである。

この 1 件を踏むのは `ts-data-forge` だけである。`configs/eslint/` から
`eslint-config-typed` の型を import しているのがこのパッケージだけで、`configs/` は
type-check の対象に入っている。他パッケージが `eslint-config-typed` を使うのは
`eslint.config.mts` の中で、そちらは tsconfig の `include` から外れている。

したがって選択肢は「上流が `.d.cts` を配るのを待つ」か「この型 import を type-check の
対象外へ動かす」のどちらかで、**`ts-data-forge` の opt-in は今回のリリースでは
完了しない**。

**2026-08-25 追記: 2 も片付いた。上流を待つ必要は無くなった。** `strict-ts-lib` 0.6.0
で `Extract` / `Pick` / `Exclude` / `Omit` の制約を upstream に戻したため、
`@eslint/plugin-kit` の `dist/cjs/types.cts` に入っている `Omit` が strict lib の
狭い `K extends keyof T` と衝突しなくなった。`.cts` がソースとして型検査される事実は
そのままだが、**その中身がもう型エラーにならない**。

その状態で測り直した結果（`libs/ts-data-forge/tsconfig.json` に
`"libReplacement": true` を足しただけ、他は無改変）:

|              | 素の lib                 | strict lib                    |
| :----------- | :----------------------- | :---------------------------- |
| `type-check` | エラー 0 件              | **エラー 0 件**               |
| `lint`       | エラー 0 件 / 警告 15 件 | エラー **23 件** / 警告 17 件 |

**型チェックは 1 件も残っていない。**「止まっている 2 件」は両方とも解消済みで、
`ts-data-forge` の opt-in を妨げるものはもう無い。

残るのは lint 23 件で、内訳は `@typescript-eslint/no-deprecated` 20 件
（`String` 13 / `Number` 3 / `Boolean` 3 / `charAt` 1）と
`@typescript-eslint/no-unnecessary-type-assertion` 3 件である。**strict lib が
`@deprecated` を付けている分を lint が読むようになったというだけ**で、`ts-fortress`
で 21 件出たのと同じ性質のもの。`ts-repo-utils`（#1618）や `ts-fortress`（#1657）と
同じく、opt-in はそれ専用の PR で入れる。**このブランチは引き続き「どちらの lib でも
同じに読めるソースにする」ところまで**で、`libReplacement` は有効にしない。

## 依存宣言を 1 件にまとめる（2026-08-21 実測）

root の `package.json` は 236 行のうち 107 行が `@typescript/lib-*` の URL だった。
これをメタパッケージ `strict-ts-lib-v7.0` 1 件に畳んだ。**pnpm の設定が 2 つ要る。
どちらか一方だけでは効かない。**

| 制約                                                                                           | 効く設定                                    |
| :--------------------------------------------------------------------------------------------- | :------------------------------------------ |
| メタパッケージの依存 107 個がすべて URL → `ERR_PNPM_EXOTIC_SUBDEP`                             | `blockExoticSubdeps: false`                 |
| 推移的依存は `node_modules/.pnpm/` に入るだけで root の `node_modules/@typescript/` に並ばない | `publicHoistPattern: ['@typescript/lib-*']` |

上の「メタパッケージ 1 つでは足りない」で見ていたのは 1 行目だけだった。2 行目が
**「pnpm だと推移的に解決できない」の正体**である。`libReplacement` の解決は
tsconfig のあるディレクトリから上へ `node_modules` を辿るだけなので、pnpm の既定の
隔離レイアウトでは推移的依存を一度も見つけられない。`publicHoistPattern` は
エイリアス（キー名 `@typescript/lib-es5` ↔ 実体名 `strict-ts-lib-v7.0-es5`）越しでも
キー名でホイストするので、root の `node_modules/@typescript/` に 107 個が並ぶ。

`publicHoistPattern` の既定値は pnpm 11 でも `[]` なので、ここで指定しても潰れる
既定は無い。

### 実測

```text
$ pnpm install                    # 依存宣言は strict-ts-lib-v7.0 の 1 件だけ
$ ls node_modules/@typescript | wc -l
107
$ cd libs/octokit-safe-types && pnpm run type-check   # opt-in 済みパッケージ
（エラー 0 件）
```

置き換えが本当に効いていることは、strict lib でしか出ないエラーで確認した。

```text
$ echo "export const n = parseInt('10', 1);" > libs/octokit-safe-types/src/probe.mts
$ pnpm run type-check
src/probe.mts(1,33): error TS2345: Argument of type '1' is not assignable to
  parameter of type '2 | 3 | … | 36 | undefined'.
```

### `blockExoticSubdeps: false` は恒久設定になる

「一度だけ CLI フラグで解決してロックファイルに焼き、設定は既定のまま」を試した。
pnpm のチェックはロックファイル由来の解決をスキップする（`resolveDependencies.js`
のコメントどおり）ので `--frozen-lockfile` は通るが、**package.json に無関係な依存を
1 つ足しただけで再解決が走って落ちる**。mono は `pnpm-update` と changesets で
package.json が頻繁に動くので、この道は無い。`blockExoticSubdeps` は boolean だけで、
ホスト単位の許可リストは pnpm 11.22.0 に存在しない。

### 代わりの防御: `check:root:lockfile`

`pnpm-lock.yaml` の `tarball:` を全件読み、strict-typescript-lib の releases 以外を
指すものがあれば落とす（`tools/scripts/cmd/check-lockfile-tarballs.mts`）。
`check:root` の一部なので、`check-all` と type-check workflow の `check:root` ジョブが
そのまま拾う。ruleset の required status check は増えない。

pnpm 自身のチェックより網羅的でもある。直接依存も見るし、pnpm がスキップする
「ロックファイルに既にある解決」も見る。

### 残る選択肢: 上流で 1 tarball 化する（未着手）

`strict-typescript-lib` 側が「107 個の lib ディレクトリを内包した tarball 1 個」を
出せば、URL の推移的依存自体が消えて `blockExoticSubdeps` を触らずに済む。消費側は
`paths` で向ける。**`libReplacement` の解決が `paths` を尊重することは実測済み**
（TypeScript 7.0.2）。ワイルドカード指定でも、`extends` 元の共有 config に書いた
場合でも効く。

ただし `paths` は `extends` でマージされず子が丸ごと上書きするので、共有 config に
1 行書くだけでは済まない。mono は 18 プロジェクト中 **15 が自前の `paths` を持って
いる**ため、15 ファイルに同じ行を足すことになる。ホイスト方式は tsconfig を一切
触らないので、まずはそちらを採った。上流が 1 tarball 化したときの消費側の変更は
「URL 1 行の差し替えと `paths` の追加」で、この節の作業は捨て石にならない。

`.pnpm/` の下を直接 `paths` で指す案は不可。ディレクトリ名が URL エンコードを含み
（`strict-ts-lib-v7.0-es5@https+++github.com+…tgz`）、リリースごとに変わる。

## リリース戦略の再設計（2026-08-21 議論）

上の「残る選択肢: 上流で 1 tarball 化する」を、配布側の制約を確認したうえで詰めた。
**結論は「per-lib 分割をやめて 1 パッケージに集約する」で、配置先（npm か GitHub
Release か）は二次的な選択**になる。

### 分割していた理由と、それが失効した経緯

per-lib に分けていたのは、**推移的依存として自動解決させるため**だった。消費側は
メタパッケージ 1 件を入れるだけでよく、tsconfig の `paths` も要らない。これは
**GitHub Packages を使う社内環境で実証されていた**もので、設計としては筋が通って
いた。

崩れたのは配置先が変わったときである。npm registry への publish がレート制限で
失敗し、GitHub Release のアセットに移した。この時点で依存は URL になり、pnpm は
URL の**推移的**依存を拒否する（`blockExoticSubdeps`）。回避には
`blockExoticSubdeps: false` に加えて `publicHoistPattern` も要る — つまり
**「設定なしで pnpm install 一発」という分割の唯一の利点は、GitHub Release へ移した
時点で既に失われていた**。残ったのはリリースコストだけ、というのが現状の正確な
評価になる。

### 配布側の制約（確定事項）

|                 |                                              |
| :-------------- | -------------------------------------------: |
| TypeScript 系統 |                            12（v5.0 … v7.0） |
| flavor          |                    2（非 branded / branded） |
| パッケージ数    |               約 107 / flavor（v7.0 で実測） |
| 生成物サイズ    | v7.0 で 4.7MB（branded 4.8MB）、全系統 163MB |

生成スクリプトの共通定義を変更すると全系統にパッチが波及するため、最悪ケースの
publish 数は **12 × 2 × 約 107 ≒ 2,400**。1 バージョン分（214）でもレート制限に
当たった実績があるので、**per-lib × npm registry は恒久的に不可能**。GitHub Packages
は公開パッケージでも読み取りに認証が要るため、外部利用者に PAT を要求することに
なり、これも採らない。

### 分割に消費者価値は無い

`libReplacement` は `lib` 設定の**閉包**を要求する。`lib: ["ESNext", "DOM"]` なら
数十個が芋づるで必要になるので、「`@typescript/lib-es2015-proxy` だけ入れる」は
成立しない。実際、README のペーストブロックも mono の 107 行も all-or-nothing
だった。粒度を保つ対価（1 リリース約 200 アセット、差分アップロード判定、バッチと
リトライ、107 エントリのリリースノート）は、誰の役にも立たないまま払われていた。

### 集約すると、URL 配布のままでも消費側の設定が消える

見落としやすい点。`blockExoticSubdeps` が禁じるのは **subdependency** の URL 依存
だけで、**直接依存の URL は常に許可される**（pnpm 11.22.0 の
`resolveDependencies.js` は `options.currentDepth > 0` を条件にしている。実測でも
一致）。

したがって 107 個を内包した tarball を GitHub Release に置くだけで、消費側の URL は
直接依存 1 件になり、`blockExoticSubdeps: false` も `publicHoistPattern` も不要に
なる。

| 配布形                            | 消費側 pnpm 設定                                   | 消費側 tsconfig |
| :-------------------------------- | :------------------------------------------------- | :-------------- |
| per-lib × URL（#1652 時点の現状） | `blockExoticSubdeps: false` + `publicHoistPattern` | 不要            |
| **bundle × URL**                  | **なし**                                           | `paths` 1 行    |
| **bundle × npm**                  | **なし**                                           | `paths` 1 行    |
| per-lib × npm                     | `publicHoistPattern` のみ                          | 不要            |

per-lib × npm が消費側には最も楽（`npm:` エイリアス経由のレジストリ依存は exotic
ではないことを実測で確認済み）だが、上のとおり配布側が不可能なので選べない。

### 推奨

1. **集約する。** これは配置先と独立に正しい
2. 配置先は **npm を第一候補**にする。publish 数が 12 × 2 = 24 に落ちるので、共通
   定義の変更でも changesets が捌ける規模になる。まず v7.0 の 2 個で試して、制限に
   当たらないことを確認してから残りへ広げる
3. npm が通れば、名前を系統ごとに増やすのをやめて **「flavor = パッケージ名、
   TypeScript マイナー = バージョンの major.minor」** に寄せる案がある
   （`strict-ts-lib@~7.0.1`）。`@types/node` が Node のメジャーに追随するのと同じ
   流儀。名前が 12 個から 2 個に減り、`~7.0` で系統内の修正だけ受け取れる
4. npm が通らなければ、同じ bundle 形を GitHub Release に置く。消費側の差分は
   「`npm:` 指定か URL 指定か」の 1 行だけで、集約という判断は無駄にならない

### 静かに失敗する経路への対策

`paths` を書き忘れた、あるいは子の tsconfig が `paths` を上書きした場合、**エラーも
警告も出ないまま置き換えだけが起きない**。mono は 18 プロジェクト中 15 が自前の
`paths` を持つので、移行時にはこの二段構えを入れる。

1. **構文レベル** — `paths` を持つ tsconfig に `@typescript/lib-*` の項があることを
   `check:root` で検査する（`check:root:lockfile` と同規模のスクリプト）
2. **意味レベル** — strict lib 下でのみ型エラーになるフィクスチャ（`parseInt('10', 1)`
   など）を用意し、opt-in 済みパッケージで**それが落ちること**を検査する。置き換えが
   実際に効いていることを直接測る唯一の方法で、配布形が今後変わっても効く

### mono 側の受け入れ作業（上流が bundle を出した後）

1 PR で収まる見込み。依存 1 行の差し替え、15 ファイルへの `paths` 追加、
`blockExoticSubdeps` と `publicHoistPattern` の削除、`check:root:lockfile` を
「`tarball:` は 0 件」への強化、上記の検査 1〜2 本。

## 移行完了（2026-08-21）

上流が bundle 形へ移り、**全系統が npm に公開された**ので、予定していた受け入れを
行った。`strict-ts-lib-v7.0` は URL ではなく **npm のレンジ依存**（`^0.2.0`）になり、
`pnpm-workspace.yaml` の 2 設定は削除した。

### 何が変わったか

|                             | 移行前                                     | 移行後                                           |
| :-------------------------- | :----------------------------------------- | :----------------------------------------------- |
| root の宣言                 | GitHub Release の URL（旧 umbrella 0.1.0） | `"strict-ts-lib-v7.0": "^0.2.0"`                 |
| `blockExoticSubdeps: false` | 必要                                       | **削除**（既定の `true` に戻った）               |
| `publicHoistPattern`        | 必要                                       | **削除**                                         |
| `node_modules`              | root に `@typescript/lib-*` が 107 個      | `strict-ts-lib-v7.0/libs/**` のみ                |
| lockfile の `tarball:`      | 108 件                                     | **0 件**                                         |
| tsconfig                    | 変更不要                                   | `@typescript/lib-*` → `libs/*` の `paths` が要る |

lib の解決数は移行前後で変わらない（`--traceResolution` で 88/88、失敗 0）。
per-lib パッケージのうち名前で引かれていたのは約 15 個だけで、残りはグループ
パッケージの中に入れ子で同梱されていたため、**実効的な厳しさは同じ**である。
`octokit-safe-types` の型チェックも移行前と同じくエラー 0 件で通る。

### 静かな失敗への対策（両方入れた）

1. **構文レベル** — `pnpm run check:root:tsconfig-lib-paths`。`paths` を定義する
   tsconfig に `@typescript/lib-*` の項が無ければ落とす。`check:root` の一部なので
   `check-all` と CI の `type-check (check:root)` が拾う。エントリを 1 つ外して
   落ちることを確認済み
2. **意味レベル** — `libs/octokit-safe-types/test/strict-lib-active.mts`。
   strict lib でのみエラーになる式（`parseInt('10', 1)`）に `@ts-expect-error` を
   付けてあるので、**置き換えが起きなくなった瞬間に型チェックが落ちる**
   （`libReplacement: false` にすると `TS2578: Unused '@ts-expect-error' directive`
   で落ちることを確認済み）。opt-in するパッケージごとに 1 つ置く

### 残っていること

`libReplacement: true` は `octokit-safe-types`・`ts-repo-utils`（#1618）・
`ts-fortress`（#1657）。**`ts-type-forge` は opt-in しない**（次章の決定 1）。
残りは `ts-data-forge` と、まだ数えていない `eslint-*` / `synstate*` /
`ts-codemod-*` / `github-settings-as-code`。`paths` は全パッケージに入っているので、
各パッケージで足すのは `"libReplacement": true` の 1 行だけになった。

## 移行方針（2026-08-22 決定）

### 決めたこと

| #   | 決定                                                                                                                     |
| :-- | :----------------------------------------------------------------------------------------------------------------------- |
| 1   | **`ts-type-forge` は strict lib を使わない。** 相互依存を作らない                                                        |
| 2   | **配置は新設の `strict-lib/`。** prettier の対象外にし、そこだけ oxfmt で回す                                            |
| 3   | **全系統のバージョンを統一する**                                                                                         |
| 4   | **GitHub Release を廃止し npm publish に一本化。** dist の生成方法だけ引き継ぎ、リリースは mono の changesets に統合する |
| 5   | **branded / 非 branded を 1 パッケージにまとめる。** 24 → 12 パッケージ。利用者は `paths` の指す先で選ぶ                 |

### 決定 1: `ts-type-forge` は strict lib を使わない

依存は**既に片方向にある**。strict lib の宣言が `ts-type-forge` を参照する側で、
`ts-type-forge` は依存ゼロのパッケージである。

| 項目                                    | 実測値（2026-08-22）                                           |
| :-------------------------------------- | :------------------------------------------------------------- |
| `strict-ts-lib-v7.0` の `dependencies`  | `ts-type-forge: ^9.0.0`                                        |
| `ts-type-forge` を参照する lib ファイル | 107 中 **18**                                                  |
| 参照している型                          | 約 25 種（`Uint8` 130 箇所、`Int8` 75、`UintRange` 37 が大半） |
| `ts-type-forge` 自身の依存              | `dependencies`・`peerDependencies` とも空                      |

`ts-type-forge` を opt-in すると、この向きが両方向になる。しかも実体としては
**自分自身の publish 済みスナップショットで自分を型チェックする**ことになる。
`pnpm` は strict lib の依存を npm から取るので、mono の `node_modules` には
workspace 版とは別に `ts-type-forge@9.2.1` が入っている。

```
node_modules/.pnpm/strict-ts-lib-v7.0@0.2.0_typescript@6.0.3/node_modules/ts-type-forge
```

いまは偶然どちらも 9.2.1 だが、ローカルで型を変えた瞬間にずれる。

**実害は既に観測している。** strict lib の `Math.abs` は
`abs<N extends number>(x: N): AbsoluteValue<N>` と宣言されており、`AbsoluteValue` は
数値リテラル型のための型なので branded 型をそのまま返す。結果 `Math.abs` した
`NegativeNumber` が `NegativeNumber` のままになる。`AbsoluteValue` 側は直せない
（`ts-data-forge` の `Int8.abs` がこの挙動に乗っており、広げると公開 API が退化する）。
**opt-in をやめれば問題ごと消える。**

やることは 3 つ。

1. `libs/ts-type-forge/tsconfig.json` に `"libReplacement": false` を**明示**する。
   将来 shared config へ移したときに巻き込まれないため。理由をコメントに書く
2. `check:root:tsconfig-lib-paths` で「意図的な opt-out」を許容する
3. 検証用に push した `feat/strict-ts-lib-type-forge` は破棄する。サンプルの
   `day: DateEnum` 修正だけは lib と無関係な改善なので、拾うなら別 PR に切り出す

**追記（2026-08-24）: opt-out を一段進め、ビルドを標準 lib ごと外した。**
`configs/tsconfig.build.json` を `"lib": []` にし、コンパイラが必須とする
グローバル型（`Array`・`Function` など）と src が名前で参照する lib 型
（`Readonly`・`Record`・`ReadonlyMap` など）だけを
`configs/minimal-lib.d.mts`（stock lib の逐語コピー、publish されない）で
供給する。これで `ts-type-forge` の公開型はどの標準 lib のスナップショットにも
依存せず、strict lib → `ts-type-forge` の依存グラフの root になる。
dist はバイト単位で変化なし。dev 側の `tsconfig.json`（型テスト・samples・
scripts）は `URL` 等の実 lib 型へのアサーションを含むので `ESNext` のまま。

`libs/*` は「1 ディレクトリ = 1 npm パッケージ」で、9 リポジトリ統合のときに確定した
規約である。生成物と生成スクリプトが同居する strict lib はこれに入らないので、
トップレベルに区画を作る。

```
strict-lib/
  scripts/                    生成スクリプト（旧 packages/scripts-common ＋ 旧 scripts/）
  v7.0/
    package.json              publish されるパッケージ（flavor 統合後は 1 系統 1 件）
    libs/<lib>/index.d.ts         ← 公開時の配置そのまま（非 branded）
    libs-branded/<lib>/index.d.ts ← 同上（branded・決定 5）
    lib-files/                生成中間物。差分の入力でもある
    temp/copied/              TypeScript 本体からのコピー原本。差分の入力
    diff/                     変換前後の差分
    diff-from-prev/           前バージョンとの差分。converter 更新要否の判断材料
  v6.0/ …
```

`lib-files/`・`temp/`・`diff/`・`diff-from-prev/` は publish されないが**開発環境の
一部**なので、そのまま持ってくる（後述）。

**「公開時の配置そのまま」が移行の必須条件である。** `paths` が指す
`node_modules/strict-ts-lib-v7.0/libs/*` は、workspace 化すると
`strict-lib/v7.0` へのシンボリックリンクになる。tarball ではなくディスク上の
ディレクトリを直接読むので、**いま pack 時にやっている
`output/packages/` → `libs/` の並べ替えが成立しなくなる**。並べ替えを消し、
最初から `libs/` に生成する。

フォーマッタは住み分ける。`.prettierignore` に `strict-lib` を足し、
`strict-lib/` 配下だけ oxfmt で回す。生成物が数千ファイルあるので、
**prettier を通さないこと自体が `fmt:full` の高速化になる**。
`style-check` と `assert-repo-is-clean` は分岐を持つことになる。

`experimental/` と同じく、**ここも独自の `.gitignore` は置かない**（リポジトリ
ルートに 1 つという規約）。

### 決定 3: 全系統のバージョンを統一する

現状は系統ごとにばらばらである。

| 系統         | 現在のバージョン |
| :----------- | :--------------- |
| v7.0 / v6.0  | 0.2.0            |
| v5.0 〜 v5.9 | 0.4.0            |

揃える利点は運用側だけの話ではない。**利用者が TypeScript を上げたとき、対応する
strict lib のどのバージョンを取ればよいか分からない**という問題が消える。
`strict-ts-lib-v7.1@1.4.0` と `strict-ts-lib-v7.0@1.4.0` が同じ世代だと名前で分かる。

changesets の `fixed` グループに入れれば自動で揃う（`.changeset/config.json`）。
最初の 1 回だけ、全系統を同じバージョンに手で合わせる必要がある。**揃える先は
`0.5.0`** — 全名を通じた最大バージョン `0.4.0` の 1 段上で、どの名前にも存在しない。
根拠は後述の「npm 上の既存パッケージをどう畳むか」。

### 決定 4: リリースは changesets に一本化

| 廃止するもの                              | 置き換え                                                                              |
| :---------------------------------------- | :------------------------------------------------------------------------------------ |
| `scripts/cmd/dist-github-release.mts`     | なし（GitHub Release をやめる）                                                       |
| `scripts/cmd/dist-npm-publish.mts`        | changesets の publish                                                                 |
| `.github/workflows/release.yml`（上流の） | mono の `release.yml`                                                                 |
| `docs/first-release.md` の手順            | 初回 publish だけは残る（後述）                                                       |
| 引き継ぐもの                              | **dist の生成方法のみ** — `ws:gen:packages` と `pack-bundle` の「何を libs に置くか」 |

GitHub Release をやめてよい根拠は、npm が正の経路になったこと。URL 配布は
「レジストリを通したくない人向けの補助」でしかなく、その補助のために 1 publish
あたり 12 リリース・24 タグを作るのは釣り合わない。

**初回 publish の手作業だけは残る。** npm の trusted publisher はパッケージごとに
設定するもので、そのパッケージが npm に存在しないと設定できない。新しい TypeScript
系統（v7.1 …）を足すときだけ、上流の `docs/first-release.md` と同じ手順が要る。
移行時にこの文書も mono へ持ってくる。

**README の更新も移行に含める。** インストール手順の URL 例を消し、npm を正として
書き直す。リポジトリへのリンクも `noshiro-pf/mono` に向け直す。

### 決定 5: flavor を 1 パッケージにまとめる（タグ削減）

changesets は**リリースしたパッケージごとにタグを打ち**（`push-git-tags: true`）、
「代表 1 件だけ」を指定するオプションは無い。素直に移すと 1 publish で 24 タグに
なる。検討した 3 案は次のとおりで、**(a) を採る**。

| 案                                                         | タグ数/publish | 評価                                          |
| :--------------------------------------------------------- | -------------: | :-------------------------------------------- |
| **(a) flavor を 1 パッケージにまとめる**                   |             12 | **採用**                                      |
| (b) そのまま受け入れる                                     |             24 | 一番単純だが、24 パッケージの維持コストが残る |
| (c) `push-git-tags: false` にして代表タグ 1 件を自前で打つ |              1 | 後述の理由で単独では採らない                  |

`strict-ts-lib-v7.0` が `libs/`（非 branded）と `libs-branded/` の両方を持ち、
利用者は `paths` の指す先で選ぶ。

```jsonc
// 非 branded
"@typescript/lib-*": ["./node_modules/strict-ts-lib-v7.0/libs/*"]
// branded
"@typescript/lib-*": ["./node_modules/strict-ts-lib-v7.0/libs-branded/*"]
```

**利用者の手間は増えない。** `paths` は元々書く必要があり、選択がパッケージ名から
その 1 行に移るだけである。コストは両 flavor をダウンロードすること（1 系統あたり
展開時 4.7MB＋4.8MB＝約 9.5MB。`.d.ts` なので packed はずっと小さい）。全系統を
1 パッケージにまとめる案は 82MB になるので採らない。

#### (c) を単独で採らない理由

タグ 1 件は魅力的だが、(a) と比べて 3 つ不利がある。

1. **`push-git-tags: false` の影響範囲がリポジトリ全体。** これはワークフロー入力
   なので、mono 自身の 17 パッケージのタグも changesets が押さなくなる。代替の
   自前ステップが `<package>@<version>` タグ全部を押す責任を負い、**リリース経路に
   単一障害点を作る**。得られるのはタグ数の見た目だけである
2. **24 パッケージが残る。** 新しい TypeScript マイナーが出るたび、初回 publish と
   trusted publisher 設定が 2 回必要なまま。(a) なら 1 回
3. **代表タグのバージョンを自前で組み立てる必要がある。** changesets は作らないので、
   ステップが代表パッケージの `package.json` を読むことになる

**(a) と (c) は排他ではない。** (a) で 12 タグまで落としたうえで、それでも気になれば
(c) を重ねればよい。順序として (a) が先である。

### npm 上の既存パッケージをどう畳むか — unpublish しない

**確認した事実**（npm 10.9.7 同梱のドキュメント）。

> Even if you unpublish a package version, that specific name and version
> combination can never be reused. In order to publish the package again, you
> must use a new version number. If you unpublish the entire package, you may
> not publish any new versions of that package until 24 hours have passed.

そして**公開済みバージョンは 1 パッケージにつき 1 件しかない**（2026-08-22 実測）。

| パッケージ                                     | 公開済み     |
| :--------------------------------------------- | :----------- |
| `strict-ts-lib-v5.0` 〜 `v5.9`（± `-branded`） | `0.4.0` のみ |
| `strict-ts-lib-v6.0` / `v7.0`（± `-branded`）  | `0.2.0` のみ |

この 2 つを重ねると、**package 全体の unpublish は「唯一のバージョンの削除」と同義**で、
必ず 24 時間ブロックに当たる。npm 自身も
`Refusing to delete the last version of the package.` と拒否し、`--force` を要求する。

**したがって unpublish はしない。** 代わりに:

| 対象                                           | 操作                                                               |
| :--------------------------------------------- | :----------------------------------------------------------------- |
| **残す 12 名**（`strict-ts-lib-vX.Y`）         | 統一バージョンを publish する。旧 `0.2.0` / `0.4.0` はそのまま残す |
| **畳む 12 名**（`strict-ts-lib-vX.Y-branded`） | `npm deprecate` で統合先を案内する。unpublish しない               |

`deprecate` は npm 自身が勧めている道でもある。

> Consider using the `deprecate` command instead, if your intent is to encourage
> users to upgrade, or if you no longer want to maintain a package.

これなら 24 時間ブロックも、unpublish の適格条件（72 時間以内・ダウンロード数・依存の
有無。policy ページはこの環境の egress proxy に阻まれて読めなかった）も一切関係なくなる。

#### 統一バージョンは `0.5.0`

**全名を通じた最大バージョンを 1 段上げる。** 現在の最大は `0.4.0`（v5 系）なので
`0.5.0`。全 24 名のいずれにも存在しないので、publish が衝突しない。

`1.0.0` にしないのは、**flavor 統合が既存利用者にとって破壊的ではない**ため。
`strict-ts-lib-v7.0` は `libs/` をそのまま保ち、`libs-branded/` が増えるだけである。
影響を受けるのは `-branded` 名を使っていた利用者だけで、そちらは deprecate の
メッセージで移行先を案内する。

### 移行前にやる掃除 — 削るのは `output` の中だけ

| 対象                                                           | ファイル数 | 扱い                                                                                                       | 状態                                  |
| :------------------------------------------------------------- | ---------: | :--------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| `output(-branded)/packages/**/package.json` のうち参照の無い分 |  **1,955** | **削除**。per-lib publish をやめた時点で死んでいる                                                         | **完了**（strict-typescript-lib#130） |
| 同 group 単位の分                                              |        199 | **残す**。各 harness が `file:output/packages/<group>` で devDepend しており、`lib-check` の名前解決に要る | —                                     |
| `output(-branded)/packages/` → `libs/` / `libs-branded/`       |          — | リネーム。pack 時のステージングを削る。決定 2 の必須条件であり、決定 5 の形でもある                        | 移植と同時                            |
| バージョン統一                                                 |          — | 決定 3。`0.5.0` へ                                                                                         | 未                                    |

上流の追跡ファイルは 9,866 → **7,911**（#130 時点）。

#### 差分の機構は開発環境の一部であって、負債ではない

**`temp/`・`output/diff-from-prev/`・`output/lib-files*/`・`output/diff-from-official/`
は残す。** 連続バージョン間の差分は、**converter script の更新が要るかどうかを判断
するための機構**として置かれている。publish されるアセットには含まれないが、開発には
要る。（2026-08 の整理でパスを揃えた: `diff-from-prev/` と `output-branded/lib-files/`
は `output/` 直下へ移り、`output/diff/` は `output/diff-from-official/` になった。）

`gen-version-diff.mts` が読む先を見れば依存関係がはっきりする。

| 差分の種類          | 入力                                             | 出力                                       |
| :------------------ | :----------------------------------------------- | :----------------------------------------- |
| `official`          | `temp/copied`（TypeScript 本体からのコピー原本） | `output/diff-from-prev/official/`          |
| `converted`         | `output/lib-files`                               | `output/diff-from-prev/converted/`         |
| `converted-branded` | `output/lib-files-branded`                       | `output/diff-from-prev/converted-branded/` |

つまり `temp/copied` は**入力**であり、追跡をやめると `official` 差分が取れなくなる。
「TypeScript 側が何を変えたか」が見えなくなるということで、それは converter を追随
させるかどうかの一次情報である。`output/diff-from-official/`（変換前後の差分、108
ファイル）も同じ性質のものとして残す。

**この文書の初版は `temp/**` の追跡をやめる案を挙げていたが、誤りである。** ファイル数
だけを見て入力と生成物を区別していなかった。削ってよいのは `output` の中の、
誰も解決しない manifest だけである。

### 手順

| Phase | 内容                                                                                                                                  | 状態                                                |
| :---- | :------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------- |
| 0     | 作業中の opt-in を完了（#1618 `ts-repo-utils` / #1657 `ts-fortress`）                                                                 | **完了**（両方 check-all 通過・CI 緑、マージ待ち）  |
| 1     | `ts-type-forge` の opt-out を明示（決定 1）                                                                                           | **完了**（`feat/ts-type-forge-no-lib-replacement`） |
| 2     | 上流の掃除（死んだ `package.json`）                                                                                                   | **完了**（strict-typescript-lib#130）               |
| 3     | `strict-lib/` へ移植。`libs/` + `libs-branded/` の 12 パッケージに再構成、`.prettierignore`・oxfmt・workspace グロブ・`paths`・README | **完了**（`feat/strict-lib-into-mono`）             |
| 4     | リリースを changesets へ。上流ワークフローと publish スクリプトを削除                                                                 | **完了**（同上）                                    |
| 5     | `0.5.0` を publish し、`-branded` の 12 名を deprecate。旧リポジトリを archive                                                        |                                                     |
| 6     | 残りの opt-in を再開（`ts-data-forge` ほか）                                                                                          |                                                     |

### 移行時に必ず確認すること

- **`paths` が実体に届いているか。** `node_modules/strict-ts-lib-v7.0/libs/*` が
  workspace のシンボリックリンク越しに解決すること。`--traceResolution` で
  `was successfully resolved` を数える（v7.0 なら 88/88）
- **probe が生きているか。** opt-in 済みパッケージの `strict-lib-active.mts` が
  `libReplacement: false` で `TS2578` になること。`tsconfig.json` の `include` に
  `test/` が入っていない罠がある（`ts-type-forge` で踏んだ）
- **ビルド順。** strict lib のパッケージが `ts-type-forge` を `workspace:^` で
  参照するので、`ws:build` のステージがそこに依存する。`dependencies` に入れる
- **`check:root:lockfile` が 0 件のままか。** URL 依存が戻っていないこと

## 移植後に分かったこと: v7.0 以外の bundle は消費できない（2026-08-23 実測）

`verify:npm-packages` に strict lib の smoke check を足したところ、**12 名のうち
`strict-ts-lib-v7.0` だけが通り、残る 11 名は通らなかった**。理由は tarball の
不備ではなく、TypeScript 側の解決方式が 7.0 を境に変わっていることにある。

### 実測（probe は `Number.isFinite('1')` に `@ts-expect-error`）

| 消費側 TypeScript | `paths` 経由 | 名前解決経由（`@typescript/lib-*`） |
| :---------------- | :----------- | :---------------------------------- |
| 5.6.3             | **効かない** | 効く                                |
| 7.0.2             | 効く         | **効かない**                        |

- 5.6.3 + `paths` → `TS2578: Unused '@ts-expect-error' directive`（置き換えが
  起きていない）
- 7.0.2 + 名前解決 → 同じく `TS2578`
- 5.6.3 + 名前解決（`@typescript/lib-<group>` を 16 件 `file:` で入れる）→ probe が
  正しくエラーになる。**published と同じ形の tarball**（`libs/**/package.json` を
  含めたもの）で確認済み

つまり両者は排他で、どちらか一方しか使えない。bundle 1 パッケージという形は
`paths` 前提なので、**`>=5.0 <7.0` 向けの 11 名は npm から入れても置き換えが
起きない**。

> **訂正（2026-08-24）** — 上表の「7.0.2 × 名前解決 = 効かない」は誤りである。
> TypeScript 7 は `libReplacement` の既定が off で、この計測ではそれを立てて
> いなかった。立てれば **7.0.2 も名前解決で置き換える**。排他ではない。
> 最終章「lib 置き換えを名前解決に一本化する」を参照。この章の残り
> ——`>=5.0 <7.0` の 11 名が `paths` では届かないこと、そこからリンカを
> 同梱するに至ったこと——は変わらない。

### なぜ名前解決に寄せられないか

名前で引かせるには `@typescript/lib-es2022` のような**名前を持つパッケージ**が
lib グループごとに要る。bundle の中の `libs/es2022/package.json` を publish して
`file:./node_modules/<pkg>/libs/es2022` を指す手は、npm では通るが **pnpm では
通らない**（`ERR_PNPM_LINKED_PKG_DIR_NOT_FOUND` — 依存グラフを解決する時点で
その `node_modules` 配下はまだ存在しない）。残るのは「minor ごとに 16 名ずつ
publish する」形で、それは決定 5 で畳んだレイアウトそのものに戻ることになる。

### 解決: リンカを同梱する（2026-08-23）

**npm パッケージも git tag も 1 件も増やさずに解決できた。** 各 bundle に依存ゼロの
`link-libs.mjs` を `bin` として同梱し、消費側の `node_modules/@typescript/lib-<group>`
を lib グループごとのシンボリックリンクにする。名前解決が要求するのはディレクトリで
あって依存グラフ上のパッケージではないので、これで足りる。group ごとの
`package.json` すら要らない（Node10 解決が `index.d.ts` にフォールバックする）。

```sh
npx strict-ts-lib-v6.0-link             # plain number
npx strict-ts-lib-v6.0-link --branded   # branded
npx strict-ts-lib-v6.0-link --unlink    # 取り消し
```

消費側は自分の `package.json` の `prepare` に 1 行足すだけ。自分のスクリプトなので
pnpm の postinstall 許可リストは関係ない。

比較した他案と、その却下理由:

| 案                              | 追加 npm | 追加 tag | 却下理由                                                    |
| :------------------------------ | -------: | -------: | :---------------------------------------------------------- |
| group 別パッケージを全 minor 分 |     ~176 |     ~176 | trusted publishing はパッケージごとの設定。176 件は非現実的 |
| 代表 1 minor だけ group 別      |       16 |       16 | どの minor を代表にするかが恣意的                           |
| npm 限定で `file:` 依存を案内   |        0 |        0 | pnpm で `ERR_PNPM_LINKED_PKG_DIR_NOT_FOUND`                 |
| v7 のみサポート                 |        0 |        0 | 11 名を捨てることになる                                     |

### `libReplacement` の要否は版で違う（実測）

パッケージを自分の TypeScript と組み合わせて全件測った。

| TypeScript | 経路     | `libReplacement`                     |
| :--------- | :------- | :----------------------------------- |
| 5.0 – 5.7  | 名前解決 | 未知のオプション。書くとエラーになる |
| 5.8 – 5.9  | 名前解決 | 既定 on                              |
| 6.x        | 名前解決 | 既定 **off**。`true` が要る          |
| 7.x        | `paths`  | 既定 **off**。`true` が要る          |

`libReplacement` が入ったのは 5.8（5.7.3 では `TS5023: Unknown compiler option`）。
既定が off になったのは 6.0 で、7.0 からではない。

**もう 1 つの罠: TypeScript 5.0 は `@typescript/lib-*` をカレントディレクトリ基準で
解決する**（設定ファイルの位置ではなく）。別ディレクトリから
`tsc -p path/to/tsconfig.json` を叩くと、黙って stock lib になる。`verify:npm-packages`
が各プロジェクトを cwd にして走るのはこのため。

### 検査

`verify:npm-packages` が 12 名すべてを space で検査するようになった。各パッケージの
README が指示する手順そのまま — v7.0 は `paths`、それ以外は同梱リンカを実行してから
probe をコンパイルする。**リンカ自体が検査対象に入る。**

`skipLibCheck: false` と古い TypeScript の組み合わせでは `types: []` が要る。無いと
tsc が space の外まで歩いてリポジトリ自身の `@types/node` を拾い、
`TS2451: Cannot redeclare block-scoped variable` で検査が埋まる。

### 決めていないこと

無し。`>=5.0 <7.0` の 11 名も publish 対象として残す。

## lint と型チェックで同じ lib を見せる（2026-08-24 実測）

#1657 で「ESLint は TS v6 で動いており `libReplacement` が有効でないのでエラーが消えた」と
書いた件の解消。

### 何が起きていたか

2 つのパスは**別の TypeScript を実行している**。

| パス       | 実体                                         | バージョン | lib 置き換えの経路 |
| :--------- | :------------------------------------------- | :--------- | :----------------- |
| 型チェック | `node_modules/typescript-native/bin/tsc`     | 7.0.2      | `paths`            |
| lint       | typescript-eslint が `require('typescript')` | 6.0.3      | 名前解決           |

`libs/octokit-safe-types` は lint も型チェックも**同じ `tsconfig.json`** を使う。そこには
`libReplacement: true` と `paths` が書いてあるが、**TypeScript 6 は lib 置き換えで `paths` を
読まない**。名前で `@typescript/lib-*` を引き、それが無いので黙って stock lib に落ちる。
`--listFiles` で数えると **stock 88 件 / strict 0 件**だった。

### 解決

`strict-ts-lib-v6.0` を root の devDependency にし、#1662 で同梱したリンカを root の
`prepare` で走らせて `node_modules/@typescript/lib-*` を作る。tsconfig は 1 行も変えない。

- 同じ tsconfig・同じ TypeScript 6.0.3 で測り直すと **strict 88 件 / stock 0 件**。型チェック側
  （TS 7 + `paths`）の 88/88 と一致する
- `strict-ts-lib-v7.0` は使えない。`peerDependencies` が `>=7.0.0 <7.1.0` なので npm が
  インストールを拒否するし、その宣言が参照する lib 名は TypeScript 6 に無い

### 2 つの lib を併用してよい理由（実測）

v6.0 と v7.0 は同じコンバータの出力で、**型としては同一**。`diff-from-prev` で数えると:

- 変化したファイル 6 件・177 行
- そのうち**コメントでない行は 4 行だけ**で、全部 `padStart` / `padEnd` の仮引数名
  （`maxLength`→`targetLength`、`fillString`→`padString`）。仮引数名は型チェックに影響しない

つまり lint と型チェックが見る型は一致する。native TS による型チェックの高速化を捨てて
TypeScript を 6 に統一する必要はない。

### 静かな失敗への対策

`paths` と同じで、リンクが無くなっても**エラーにならず lint が緩くなるだけ**。
`pnpm run check:root:strict-lib-links` が 18 本のリンクの解決を確認して落とす
（`check:root` の一部なので `check-all` と CI が拾う）。リンクを 1 本消して落ちることは確認済み。

### 影響範囲

`libReplacement` は 6.x でも 7.x でも既定 off なので、名前が生えても**明示的に opt-in した
パッケージ以外は何も変わらない**。現状 `libs/octokit-safe-types` のみ。

## lib 置き換えを名前解決に一本化する（2026-08-24 実測）

「lint と型チェックで同じ lib を見せる」で入れた構成は、**同じ目的に 2 つの機構**を
使っていた。型チェックは `paths` で `strict-ts-lib-v7.0` を、lint は名前解決で
`strict-ts-lib-v6.0` を見る、という形である。`@typescript/lib-*` という名前は
1 組しか張れないので「両方リンクする」は原理的に不可能で、統一するには
**片方の lib セットが両方のコンパイラに効く**必要があった。効いた。

### 実測

probe は `Number.isFinite('1')` への `@ts-expect-error`。`paths` は一切書かず、
`libReplacement: true` だけを立てて計測した。

| リンクする lib | TypeScript 6.0.3 | TypeScript 7.0.2 |
| :------------- | :--------------- | :--------------- |
| v6.0           | 88 件            | **88 件**        |
| v7.0           | **88 件**        | 88 件            |

いずれもコンパイラ自身の lib は 0 件で、probe も通る。とくに:

- **TypeScript 7.0.2 は名前解決で lib を置き換える。** 2026-08-23 の表で
  「効かない」としたのは `libReplacement` を立てていなかったためで、誤りだった
- **v7.0 の lib セットは TypeScript 6.0.3 でも通る。** しかも計測に使った
  tsconfig は `skipLibCheck: false`（既定）なので、TS 6 が 88 ファイルを
  **全数型チェックして無エラー**である

このリポジトリの実物でも同じだった。`paths` を全部消し `strict-ts-lib-v7.0` を
リンクした状態で `libs/octokit-safe-types` を測ると、lint 側の TS 6.0.3・型チェック
側の TS 7.0.2 とも **strict 88 件 / stock 0 件**で一致する。

### 変えたこと

- ルートの `prepare` が張るのは `strict-ts-lib-v7.0`。`strict-ts-lib-v6.0` の
  devDependency は削除
- `tools/configs/tsconfig/tsconfig.type-check.json` と、自前の `paths` を持つ
  14 パッケージから `@typescript/lib-*` のエントリを削除。**`paths` を再掲する
  義務が消えたので `check:root:tsconfig-lib-paths` は廃止**した。静かな失敗への
  対策は `check:root:strict-lib-links` と各パッケージの probe に一本化される
- `strict-ts-lib-v7.0` の `peerDependencies` を `>=6.0.0 <8.0.0` に拡大。実測に
  合わせただけでなく、これが無いと npm 側で TS 6 との同居が ERESOLVE で拒否される

### `paths` を捨てたわけではない

公開パッケージの README は `paths` 経由の設定を引き続き案内する。TypeScript 7
だけを使うプロジェクトにとっては `prepare` を足さずに済む分そちらが素直で、
`verify-npm-packages` も v7.0 についてはこの経路を検証し続ける。**消したのは
このリポジトリ自身の開発時構成における二重性**であって、利用者の選択肢ではない。

### 版ごとのパッケージは引き続き要る

v7.0 が TS 6 まで面倒を見られるのは、6.0 と 7.0 の宣言が実質同一だからである。
TypeScript 5.x はそうではない。テンプレートリポジトリの互換マトリクスで、
リンクを張ったまま `typescript@5.1` を走らせると **v6.0 の宣言そのもの**が
`TS2317` / `TS2727` / `TS2795` で落ちた。`>=5.0 <6.0` の 10 名は畳めない。

同じ理由で、**リンクを張ったまま古い TypeScript を走らせてはいけない**。
TypeScript 5.0–5.7 は `libReplacement` を持たず名前解決を無条件に行うので、
消費者視点を再現する種類の検査は、その前にリンクを外す必要がある。

## `Exclude` / `Omit` の制約を upstream に戻す（2026-08-24）

この lib は 4 つのユーティリティ型のうち 2 つで、第 2 引数の制約を upstream より
狭めていた。それをやめる。

| type      | upstream                       | これまで                     | これから |
| :-------- | :----------------------------- | :--------------------------- | :------- |
| `Exclude` | `Exclude<T, U>`                | `Exclude<T, U extends T>`    | upstream |
| `Omit`    | `Omit<T, K extends keyof any>` | `Omit<T, K extends keyof T>` | upstream |
| `Extract` | `Extract<T, U>`                | 同じ                         | 同じ     |
| `Pick`    | `Pick<T, K extends keyof T>`   | 同じ                         | 同じ     |

`Extract` と `Pick` は upstream がもともと同形なので、実際に変えたのは 2 つである。
`keyof any` は `PropertyKey` と同値で、生成物では後者で書く（any→unknown codemod が
`keyof any` を `keyof unknown`＝`never` にしてしまうため、どのみち書き直しが要る）。

### なぜやめるか

**狭めることは、呼び出し側の判断を lib が代わりに下すことである。** しかも 2 つの
読みのうち片方しか当たらない。「持っていないかもしれないキーを引く」は正当な記述で、
upstream 自身の宣言もサードパーティのコードもそう書く。狭い制約の下ではそれが
`TS2344` になり、**宣言が依存パッケージの中にある場合は手の打ちようがない**。

実例を 2 つ踏んだ:

- `@eslint/plugin-kit` は型を `dist/cjs/types.cts`（宣言ファイルではなく実装ファイル
  なので `skipLibCheck` が効かない）で配り、その中で
  `Omit<CustomRuleTypeDefinitions, keyof Options>` と書いている。テンプレート
  リポジトリではこれ 1 件のために `eslint.config.mts` だけ素の lib に分ける
  tsconfig を用意する羽目になった
- upstream の `lib.esnext.temporal.d.ts` と `lib.dom.d.ts` は、この lib 自身の
  変換過程で `TS2344` になっていた。回避のため `RelaxedExclude` へ差し替える置換を
  converter に 3 箇所入れていた（`ToObjectEntries` の生成コードを含む）。**自分で
  狭めた制約を自分で回避していた**ことになる

明示化は呼び出し側のコードでやるほうが筋がよく、そのための lint が既にある。
`eslint-plugin-ts-type-forge` の `prefer-strict-or-relaxed-utility-type` が
`Exclude` / `Extract` / `Omit` / `Pick` を `ts-type-forge` の `Strict*` / `Relaxed*` に
向けさせる。ルールの説明どおり「**チェックされない第 2 引数を明示的な選択にする**」
のが目的で、そちらなら意図が書き残るし、依存パッケージの宣言を巻き込まない。

### 影響

**受け入れる範囲が広がるだけなので、これまで通っていたものは通り続ける**（minor）。
converter 側の `RelaxedExclude` 回避 3 箇所は削除した。

### 確認

- 12 系統すべてを `gen:with-codemod-fixed` で再生成
- lib-check を全数実行して型エラー 0 件。v5.0〜v5.9 は plain / branded の
  20 harness をそれぞれ自前の TypeScript・`skipLibCheck: false` で、v6.0 と v7.0 は
  `tsconfig.lib-check.json` と `tsconfig.lib-check.webworker.json` で

### 余談: 生成の入口が 2 つ壊れていた

この作業で判明した。`ws-gen-stages.mts` は 4 つの stage runner のうち唯一
`rootPackageJsonDir` に `strict-lib/`（`package.json` が無い）を渡しており、
`strict-lib:gen` は `ENOENT` で即死していた。直すと今度は `dependencyFields` も
唯一欠けていて `Circular dependency detected` になった。さらに
`ws-gen-with-codemod-fixed-stages.mts` にはスクリプトが 1 つも向いていなかった。
**このリポジトリのチェックアウトで実際に必要な入口はそれ**である
（`gen` は gitignore 対象の `temp/codemod-fixed` を再利用し、`gen:full` は
ネットワーク取得から始まる）。リリース経路が `gen:packages` しか回さないので
誰も気づいていなかった。

## `ts-repo-utils` の opt-in（2026-08-14 計測、2026-08-24 再測）

型 2 件・lint 7 件。**どちらも、標準 lib でも通る形に直せた**ので、この
パッケージには「どちらの lib を前提にするか」の分岐が残っていない。

**うち 1 件は lib 側が直したので、こちらでは何もしないのが正解になった**
（`dist-v7.0-0.1.0`）。回避として書いていた明示的なループは取り消し、
`Object.fromEntries` に戻してある。残る 1 件と lint 7 件は下表のとおり
こちら側の修正である。

| 指摘                                          | 直し方                                           |
| :-------------------------------------------- | :----------------------------------------------- |
| `Object.fromEntries` が `Partial<...>` を返す | lib 側の不具合。`dist-v7.0-0.1.0` で解消         |
| `replaceAll` のキャプチャ群が `unknown`       | 可変長引数で受けて `isString` で絞る             |
| `String` が `@deprecated`（lint 7 件）        | `unknownToString`（`ts-data-forge`）に置き換える |

3 つ目は元々このリポジトリの慣例で、`gen-docs.mts` などは既に
`unknownToString` を使っていた。strict lib の `@deprecated` は、その慣例が
徹底されていない箇所を挙げてくれたことになる。`String(x)` と違って
`[object Object]` にならないので、置き換えは実質的な改善でもある。

2 つ目は strict lib の言い分が正しい。省略可能なグループは不参加のとき
`undefined` になるので、`string` と決めつけられない。ここでは 3 つとも必須なので
絞り込みが実際に落ちることはないが、型の上では書く必要がある。

### 測り直しで変わったこと（2026-08-24）

このブランチは長く開いていたあいだに 3 つの前提の上に書かれ、そのうち 3 つとも
「lint と型チェックで同じ lib を見せる」（前章）で失効した。**ESLint も TypeDoc も
`typescript` 6.0.3 で走るので、リンカが名前を生やしたいま、両方とも strict lib を
見る。**

| このブランチが書いていたこと                                                     | 再測（2026-08-24）                                                                                                                                             |
| :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint 7 件は bundle 移行後は出ないので、置き換えは慣例に沿っただけの変更          | **出る。** `String` の `@deprecated` は再び指摘される。置き換えは慣例どおりであると同時に、opt-in に必要でもある                                               |
| `no-unsafe-assignment` の `eslint-disable` は opt-in 後も要る                    | **要らない。** ESLint からも `JSON.parse` は `JsonValue` に見えるので、残すと「Unused eslint-disable directive」で落ちる。削除した                             |
| TypeDoc は `configs/tsconfig.build.json` を見せないと probe の `TS2578` で落ちる | **落ちない。** probe が通るようになったので、`typedoc.config.mjs` の `tsconfig` 上書きは取り消し、main のままにした。`test/` の型エラーは引き続き `doc` が拾う |

`ts-fortress`（#1657）で見積もっていた lint 21 件も、同じ理由で**また起きうる**。
opt-in の見積りは型エラーだけでよい、という前節の結論は取り消しである。

### 確認したこと

opt-in のたびに、次の 2 つを確認する。

- **標準 lib でも型チェックが通る**こと（`libReplacement` を一時的に `false` に
  して `tsc --noEmit`）。`src` を配るパッケージでは、これが崩れると消費者の
  エディタが赤くなる。`ts-repo-utils` では probe の `TS2578` だけが出た
- **`dist` が変わらない**こと。両方の lib でビルドして `diff -r` を取る。
  `ts-repo-utils` では差分なしだった

**2026-08-25 追記: 後者は構造的に保証されていた。** `diff -r` が毎回差分なしに
なるのは偶然ではない。opt-in は各パッケージの `tsconfig.json` に `libReplacement`
を書くが、宣言を emit する `configs/tsconfig.build.json` は**その `tsconfig.json` を
`extends` していない**（`tools/configs/tsconfig/` の共有 config 3 つを直接
`extends` している）。共有 config のどれも `libReplacement` を設定していないので、
**`build` は常に素の lib で走る**。実際 `libs/*/dist` を全走査しても
`StrictLibInternals` は 1 件も出てこない。

したがって「opt-in が `dist` を変えていないか」を PR ごとに測る必要は無い。壊れる
としたら経路は 1 つだけで、**共有 config か `configs/tsconfig.build.json` の側に
`libReplacement: true` が入ったとき**である。逆に言えば、宣言を strict lib で
emit したくなった日には、この構造ごと考え直すことになる。

## `ts-fortress` の opt-in（2026-08-22 計測、2026-08-24 再測）

**型エラー 1 件、lint 21 件。** 2026-08-14 の見積り（型 4 件・lint 21 件）に対し、
型は減り、**lint は見積りどおりに戻った**。

型が減ったのは strict-typescript-lib#117 が lib 側を直したぶん。lint は
2026-08-22 の計測時点では 0 件で、「ESLint が strict lib を見なくなったから
もう起きない」と書いていたが、**それは誤りだった**。「lint と型チェックで同じ
lib を見せる」（前章）でリンカを入れたいま、ESLint も strict lib を読むので
`@typescript-eslint/no-deprecated` は当初の見積りどおり 21 件を挙げる。

### 型エラー 1 件

`record.mts` の

```ts
const sourceKeys = new Set(Object.keys(shape));
```

で、strict lib の `Object.keys` は「その record 自身のキーの union」を返すため
`Set<ToStr<keyof S>>` に推論される。あとで `Object.keys(a)`（検証対象の値のキー、
ただの `string`）で `has` を呼ぶので、そこが落ちる。

**注釈を付けて広げるのが正しい。** ここでやりたいのは所属判定なので、要素型は
`string` でよい。

```ts
const sourceKeys: ReadonlySet<string> = new Set(Object.keys(shape));
```

`Object.keys` の戻りが狭いこと自体は strict lib の狙いどおりで、キャストで
潰すべきものではない。素の lib でもこの注釈は通る。

### lint 21 件

全部 `String` の `@deprecated` である。内訳と直し方:

| 箇所                                      | 件数 | 直し方                                     |
| :---------------------------------------- | ---: | :----------------------------------------- |
| `src/primitives/number.mts`               |   10 | `String(x)` → `x.toString()`               |
| `src/primitives/bigint.mts`               |   10 | 同上                                       |
| `scripts/cmd/embed-examples-in-jsdoc.mts` |    1 | `String(error)` → `unknownToString(error)` |

前者 20 件は制約違反を報告するときの `value` を作っている箇所で、引数はすべて
`number` / `bigint` に絞り込み済みなので `toString()` でよい。`literal.mts` や
`validation-error.mts` は既にそう書いていたので、慣例に揃えたことにもなる。
出力される文字列は `String(x)` と同一なので、**公開 API にも実行時挙動にも
変化は無い**（`-0` も `NaN` も同じ）。

最後の 1 件は引数が `unknown` なので `ts-data-forge` の `unknownToString`。
`ts-repo-utils`（#1618）と同じ形である。

### TypeDoc の回避策は要らなくなった

#1618 と同様、`configs/typedoc.config.mjs` を `configs/tsconfig.build.json` に
向ける変更は取り消した。TypeDoc も `typescript` 6.0.3 で走るので、リンカが
名前を生やしたいま `test/strict-lib-active.mts` の probe が通る。パッケージの
`tsconfig.json` を見せたままにしておけば、`test/` の型エラーも引き続き `doc` が
拾う。

### 確認したこと

- `libReplacement: true` で type-check・lint とも通り、テスト 1666 件も通る
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる。つまり
  `src` はどちらの lib でも同じに読める

**2026-08-25 追記: 0.6.0 でも件数は変わらない。** `Extract` / `Pick` / `Exclude` /
`Omit` の制約を upstream に戻した版で測り直したが、このブランチの修正を main の
ソースに戻して opt-in だけ有効にすると、**型エラー 1 件（`record.mts`）と lint
21 件**がそのまま出る。上の 4 つの型はここで踏んでいないので、緩和の影響を受けない。

## `ts-codemod-lib` の opt-in（2026-09-01 実測）

**型エラー 1 件・lint 1 件。** これまでで最も安い。どちらも**素の lib でも通る形**
に直せたので、`ts-repo-utils` と同じく「どちらの lib を前提にするか」の分岐は
残っていない。

### なぜ `ts-std-forge` ではなくこちらを選んだか

依存の順序でいえば `ts-std-forge`（依存は `ts-data-forge` だけ）が先だが、
`libReplacement` を有効にして出る 4 件は
`src/safe-number/impl/` の `toFixed` / `toExponential` / `toPrecision` /
`toString` に集中しており、**strict lib がこれらの引数を桁数・基数の
リテラル union に絞っている**ことによる。これは
[#1741](https://github.com/noshiro-pf/mono/pull/1741) が
`UintRangeInclusive` へ寄せる作業でまさに触っている 3 ファイルと重なるので、
そちらが入ってから測り直すのが正しい。

`ts-std-forge` の 4 件は「安全な標準ライブラリのラッパ」を名乗るパッケージが
`toFixed(101)` の `RangeError` を型で止められていない、という指摘であって、
opt-in を待つ理由にはならない。**#1741 のあとに 1 件として起こす。**

### 型エラー 1 件 — `replaceAll` のキャプチャ群

`ts-repo-utils`（#1618）で既に出ていたパターンの再演で、
`convert-to-readonly.test.mts` の

```ts
(_match, comment: string) => `${comment}${placeholder}`;
```

が落ちる。strict lib は省略可能なグループが不参加のとき `undefined` になる
ことを理由にキャプチャ群を `unknown` と型付けるので、`string` と決めつけられない。

**直し方は #1618 と同じ**（可変長引数で受けて `isString` で絞る）。ここの
グループは省略可能ではないので絞り込みが実際に落ちることはないが、型の上では
書く必要がある。

なお、このコールバックはキャプチャを定数に連結しているだけなので、置換文字列
`` `$1${placeholder}` `` で書けば**コールバックごと消せる**。実際に試したが
`unicorn/no-unsafe-string-replacement` が「置換値がリテラルでない」として
弾くので、コールバックのまま残した。

### lint 1 件 — `charAt`

`wrap-with-parentheses.mts` の `trimmed.charAt(mut_i)`。strict lib が
`charAt` に `@deprecated`（`String#at` を使え）を付けている。

`at` は範囲外で `undefined` を返すので、**`parenDepthDelta` の引数を
`string | undefined` に広げた**。この関数はもともと括弧以外をすべて
`default: return 0` に落としており、「そこに文字が無い」ときの深さの変化も
同じ 0 である。`?? ''` で空文字を作るより、型が実態に合う。

`@typescript-eslint/switch-exhaustiveness-check` は `default` があっても
union の全メンバを要求するので、`case undefined:` を明示してある。

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件、テスト 663 件も通る
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 33 個が true / false で完全一致
- `pnpm run doc` も通る

## `ts-data-forge` の opt-in（2026-09-01 実測）

**型エラー 5 件、lint 26 件。** 2026-08-25 の計測（型 0 件・lint 23 件）から
どちらも増えているが、増えたぶんはいずれもその後に入ったコードによるもので、
strict lib 側の後退ではない。

### 型エラー 5 件はすべて `eslint-config-typed` の中

`ts-data-forge` 自身の `src` は 0 件のままである。5 件は
`prefer-nullish-coalescing-when-safe.mts`（#1697 で追加）にあり、
**このパッケージだけがそこを型チェックの対象に引き込む**。`configs/eslint/` から
`eslint-config-typed` の型を import しており、その解決先を `paths` でソースに
向けているためで、他パッケージが `eslint-config-typed` を使うのは
`eslint.config.mts` の中だけ、そちらは tsconfig の `include` の外にある。
「止まっている 2 件」の 2 と同じ経路である。

中身は 5 件とも同じ形で、型引数の無い `new Set([...])` である。

```ts
const SINGLE_FALSY_SUMMARY: ReadonlyRecord<FalsyValueTag, TypeSummary> = {
    emptyString: { falsyValues: new Set(['emptyString']), nullable: false },
    // …
};
```

素の lib の `SetConstructor` は `new <T = any>(values?: readonly T[] | null)`
だが、strict lib は既定型引数を落として
`new <T = never>(): Set<T>` と `new <T>(values: readonly T[]): Set<T>` の
2 つに割っている。結果として文脈型が要素リテラルまで流れず `Set<string>` に
推論され、`ReadonlySet<FalsyValueTag>` に代入できない。

**型引数を明示するのが正しい。** `new Set<FalsyValueTag>([...])` はどちらの lib
でも同じに読め、意図も明示される。`EMPTY_FALSY_SET` のように const 自体へ注釈が
付いている 1 件は元から通っており、そこと形が揃う。

### lint 26 件

`@typescript-eslint/no-deprecated` 23 件と
`@typescript-eslint/no-unnecessary-type-assertion` 3 件。内訳と直し方:

| 箇所                                                               | 件数 | 直し方                                                |
| :----------------------------------------------------------------- | ---: | :---------------------------------------------------- |
| `src/guard/*.test.mts`                                             |   10 | 既にある `unicorn/new-for-builtins` の disable に併記 |
| `src/collections/imap-mapped.mts`, `iset-mapped.mts`               |    4 | `String(x)` → `unknownToString(x)`                    |
| `src/functional/*.test.mts`                                        |    3 | 同上                                                  |
| `src/array/impl/*.test.mts`, `src/collections/imap.test.mts`       |    3 | `String(x)` → `x.toString()`                          |
| `src/json/json.test.mts`                                           |    1 | `String(undefined)` → `'undefined'`                   |
| `src/guard/is-non-empty-string.test.mts`                           |    1 | `charAt(0)` → `at(0)`                                 |
| `scripts/cmd/embed-examples-in-jsdoc.mts`                          |    1 | `String(error)` → `unknownToString(error)`            |
| `src/collections/imap.mts`, `iset.mts`, `src/number/enum/int8.mts` |    3 | 表明は残し、disable に併記                            |

**`unknownToString` に寄せた 4 件は、揃えたことにもなる。** `imap.mts` と
`iset.mts` は同じ「key not found」警告を既に `unknownToString` で組み立てて
おり、mapped 版 2 ファイルだけが `String(...)` だった。`MapSetKeyType` は
`Primitive` なので `null` / `undefined` を取り得て `toString()` は使えない。
bigint のキーで出力が `1` から `1n` に変わるが、`console.warn` の診断文字列
だけで、テストもこの文言には触れていない。

**boxed primitive を作る 10 件に disable を併記したのは、そこが主題だから。**
`isPrimitive(new String('hello'))` が `false` を返すことを確かめる検査で、
`new String` を消したらテストが消える。`Object('hello')` に逃げても strict lib
は `ObjectConstructor` にも `@deprecated` を付けているので同じである。10 件とも
**既に `unicorn/new-for-builtins` の disable が付いており**、そこへ規則名を
足すだけで済んだ。

### `src` を strict lib 専用にしてはいけない（このパッケージでは特に）

`no-unnecessary-type-assertion` の 3 件は、表明を**消すと** strict lib でしか
通らないソースになる。

```text
src/collections/imap.mts(756,26): error TS2345: Argument of type
  'K | (WidenLiteral<K> & {})' is not assignable to parameter of type 'K'.
src/number/enum/int8.mts(40,57): error TS2322: Type 'number' is not
  assignable to type 'AbsoluteValue<N>'.
```

`ts-fortress` が置いた基準（`libReplacement: false` で **probe だけ**が落ちる）
を満たさなくなるうえ、ここには実害もある。**`configs/tsconfig.build.json` は
パッケージの `tsconfig.json` を extends していない**（共有 config を直接
extends する）ので、`libReplacement` は宣言 emit に効かない。つまり
`pnpm run build` は `src` を素の lib で型チェックしており、strict lib 専用の
ソースは**ビルドを落とす**。

したがって表明は残し、disable に `@typescript-eslint/no-unnecessary-type-assertion`
を併記した。素の lib で必要・strict lib で不要という状態そのものを書き留めた形
である。

この構造は opt-in 済みの 3 パッケージと同じなので、**公開される `.d.mts` は
opt-in の影響を受けない**。実際、`libReplacement` の true / false で 2 通り
ビルドして 196 個の `.d.mts` を突き合わせ、全一致を確認した。

### probe の置き場所

`test/strict-lib-active.mts` は他の 3 パッケージと同じだが、このパッケージの
`eslint.config.mts` には `test/**/*.mts` に対して「テストファイルは export して
はならない」という `no-restricted-syntax` があり、probe の `export` と衝突する。
export を外すと今度は `import-x/unambiguous` が「script として解釈できる」と言う。

probe はテストではない（`@ts-expect-error` 1 個がファイルの全内容で、`export` は
その宣言が未使用ローカルにならないためのもの）ので、**そのブロックの `ignores`
に 1 件加えて対象外にした**。規則を緩めたわけではなく、適用範囲を実態に合わせた
ものである。

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件、テスト 3340 件も通る
  （lint の警告 15 件は opt-in 前と同じ `unicorn/prefer-temporal`）
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 196 個が true / false で完全一致
- `pnpm run doc` も通る。#1618 / #1657 と同じく TypeDoc の回避策は要らない

## `github-settings-as-code` の opt-in（2026-09-01 実測）

**型エラー 0 件・lint 0 件。** [`synstate-react-hooks` の節](#synstate-react-hooks-の-opt-in2026-09-01-実測)で
測った 3 つの最後で、**唯一まったく直すところが無かった**。

`better-react-use-state` と同じく `tsconfig.json` に `compilerOptions` ブロックが
無かったので足している。`include` には既に `./test` があったので、そちらは
そのまま。

### `.d.mts` の比較でやり方を間違えた

このパッケージの `build` は、宣言 emit の前に **`pnpm run type-check`（`test/` を
含む全スコープ）を走らせる**。ここまでの 7 パッケージの `build` は `src` の
宣言 emit だけだったので、同じ手順が通用しない。

`libReplacement: false` にして 2 回目のビルドを走らせると、**probe 自身が
`TS2578` で落ちてビルドが止まる**。`dist/` は 1 回目のまま残るので、そのまま
突き合わせると「一致」と出てしまう — 実際には**同じ成果物を自分自身と比べて
いる**だけである。

正しくは probe を一時的に外し、`dist/` を毎回消してから両方ビルドする。そう
すると 2 回とも exit 0 で 42 個の `.d.mts` を生成し、**全一致**する。

**「一致した」だけでは足りない。ビルドが実際に走ったことも確かめる。**
opt-in のたびにこの確認をするなら、`build` が何をするパッケージなのかを先に
見ておく必要がある。

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件、テスト 7 件も通る
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 42 個が true / false で完全一致（上記の手順で）
- `pnpm run doc` も通る

## `better-react-use-state` の opt-in（2026-09-01 実測）

**型エラー 0 件・lint 1 件。** 内容は
[`synstate-react-hooks` の節](#synstate-react-hooks-の-opt-in2026-09-01-実測)で
測った 3 つのうちの 1 つで、そこに書いたとおり `String(error)` 1 件である。

### `tsconfig.json` に `compilerOptions` が無かった

これまでの 6 パッケージと違い、このパッケージの `tsconfig.json` は
`extends` と `include` だけで `compilerOptions` ブロックを持っていなかった。
opt-in するにはまずそれを足すことになる。

同じ形のものが他にもあるはずで、**「`compilerOptions` を足す」ぶんだけ
diff が増えるパッケージが残っている**ということでもある。

### `test/` も無かった

probe の置き場である `test/` が無く、`include` にも入っていなかったので、両方
足した。`files` は `["src", "dist", "README.md", "LICENSE"]` なので `test/` は
公開されない。probe は `.test.mts` ではないため vitest も拾わない（このパッケージ
には `test` スクリプト自体が無い）。

### lint 1 件 — `String(error)`

`scripts/cmd/build.mts` の `runStep` で、失敗したビルドステップのエラーを
表示している箇所。引数は `catch` の `unknown` なので `unknownToString`。

**これでリポジトリ内 5 つ目**である（`ts-repo-utils` / `ts-fortress` /
`ts-data-forge` / `synstate-react-hooks` に続く）。前 4 つは
`embed-examples-in-jsdoc.mts` だったが、今回は `build.mts` で、
**同じ書き方が別のスクリプトにも広がっている**ことが分かった。

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 3 個が true / false で完全一致
- このパッケージに `doc` スクリプトは無い

## `synstate-react-hooks` の opt-in（2026-09-01 実測）

**型エラー 0 件・lint 1 件。** これまでで最も安い。

### 3 パッケージまとめて測った

同じ手順で 3 つ測り、いちばん意味のあるものを選んだ。

| パッケージ                |  型 | lint | 内容                                            |
| :------------------------ | --: | ---: | :---------------------------------------------- |
| `github-settings-as-code` |   0 |    0 | **完全に無料**                                  |
| `synstate-react-hooks`    |   0 |    1 | `String(error)` 1 件                            |
| `better-react-use-state`  |   0 |    1 | `String(error)` 1 件。tsconfig の構造変更が要る |

`better-react-use-state` の `tsconfig.json` には `compilerOptions` ブロック自体が
無いので、opt-in するにはまずそれを足すことになる。残り 2 つはそのまま入る。

**3 つとも入れる価値はある。** ここでは公開ライブラリで、かつ指摘が
既知のパターンである `synstate-react-hooks` を選んだ。

### lint 1 件 — `String(error)`

`scripts/cmd/embed-examples-in-jsdoc.mts` の

```ts
return Result.err(`❌ Failed to embed JSDoc examples: ${String(error)}`);
```

で、`ts-fortress`（#1657）とファイル名まで同じである。引数が `unknown` なので
`unknownToString` に置き換えた。

**このファイルはリポジトリ内で 4 つ目の同じ箇所になる。** `ts-fortress` と
`ts-repo-utils` は opt-in 時に直っており、`ts-data-forge` は #1745 で直した。
`embed-examples-in-jsdoc.mts` を持つ他のパッケージにも同じ行が残っている
可能性が高いので、opt-in のたびに 1 件ずつ出てくることになる。

## `synstate-react-hooks-compat` の opt-in（2026-09-01 実測）

**型エラー 0 件・lint 1 件。** `embed-examples-in-jsdoc.mts` の 117 行 60 桁の
`String(error)`。**16 件目にして、この行の最後の 1 つ。**

### `embed-examples-in-jsdoc.mts` の重複は解消した

同じスクリプトを持つ 7 パッケージすべてで、同じ行を直し終えた。

| パッケージ                    | 直した PR |
| :---------------------------- | :-------- |
| `ts-repo-utils`               | #1618     |
| `ts-fortress`                 | #1657     |
| `ts-data-forge`               | #1745     |
| `synstate-react-hooks`        | #1752     |
| `synstate-preact-hooks`       | #1761     |
| `synstate-preact-signals`     | #1765     |
| `synstate-react-hooks-compat` | 本 PR     |

**7 つのパッケージが同じスクリプトのコピーを持っている**という事実自体は
残っている。`String(...)` は片付いたが、次に同じ種類の指摘が出れば、また
7 箇所を 7 回直すことになる。共通化する価値はあるが、それは opt-in とは別の
作業である。

### opt-in できるパッケージはこれで尽きた

独立して進められるものは無くなった。残りはいずれも**判断待ち**である。

| 対象                  | 待っているもの                                    |
| :-------------------- | :------------------------------------------------ |
| `synstate`            | `samples/docs-site/why-reactive/` の扱い（#1761） |
| `eslint-config-typed` | #1745 のマージ（型 5 件はそちらで解決済み）       |
| `ts-std-forge`        | #1741 のマージ（`safe-number/impl/` が重なる）    |
| `ts-type-forge`       | 意図的な opt-out。#1764 に観測を記録              |

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件、テスト 6 件も通る
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 9 個が true / false で完全一致
- `pnpm run doc` も通る

## `eslint-plugin-ts-type-forge` の opt-in（2026-09-01 実測）

**型エラー 0 件・lint 2 件。** #1763 で予告したとおり、`build.mts` と
`gen-rule-types.mts` の `String` 2 件だけだった。3 つのプラグインのうち
`prefer-canonical-*` 系の規則を持たないのはこれだけで、`includes` の件は
出ない。

これで `String(...)` の置き換えは **13〜14 件目**である。

### opt-out されている `ts-type-forge` を巻き込む形になる

このパッケージの `paths` は `ts-type-forge` をソースへ向けているので、
**deliberately opted OUT のはずのパッケージの宣言が、ここでは
`libReplacement: true` の下で型チェックされる**。`ts-data-forge` の opt-in
（#1745）が `eslint-config-typed` を巻き込んだのと同じ経路である。

**実測では型エラー 0 件だった。** `ts-type-forge` の opt-out は、その
`tsconfig` で自分自身を検査するときの話（`AbsoluteValue` の pass-through と、
strict lib 側が 107 宣言のうち 18 で `import('ts-type-forge')` を参照する
循環）であって、**consumer 側のプログラムに引き込まれたときに壊れるという
意味ではない**、と分かったことになる。

ただしこれは「このパッケージが import する範囲では」という限定つきの観測で
ある。`ts-type-forge` 自身の opt-in を検討するときの根拠にはならない。

`lib` が `["ESNext"]` に絞られている（DOM を入れると `DeepReadonly<URL>` の
厳密等価アサーションが壊れるため）点も効いている可能性がある。probe は通る
ので、置き換え自体は効いている。

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件、テスト 77 件も通る
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 16 個が true / false で完全一致
- probe を置いてから lint を測った（#1762 の反省）

## `eslint-plugin-ts-fortress` の opt-in（2026-09-01 実測）

**型エラー 0 件・lint 3 件。** #1762 で予告したとおり、
`eslint-plugin-ts-data-forge` と**同じ 3 種類が同じ形で出た**。

| 箇所                                                     | 内容                                      |
| :------------------------------------------------------- | :---------------------------------------- |
| `src/rules/prefer-canonical-length-constrained-type.mts` | `includes` の型述語で `index` が `never`  |
| `scripts/cmd/build.mts`                                  | `String(error)` → `unknownToString`       |
| `scripts/cmd/gen-rule-types.mts`                         | `String(rule.deprecated)` → `.toString()` |

**直し方も同じで通った** — `index` を使う 2 行を `includes` の guard の前へ
動かすだけ。#1762 に書いた「同じ直し方が効くはず」という見込みが当たった形で、
この 2 つのプラグインが同じ雛形から作られていることの裏付けでもある。

`eslint-plugin-ts-type-forge` の残り 2 件も `build.mts` と
`gen-rule-types.mts` の `String` なので、同じ 2 箇所だけのはずである。

### 手順の修正が効いた

#1762 では probe を置く前に lint を測って取りこぼしたので、今回は
**probe を置いてから測った**。このパッケージには「テストファイルは export
してはならない」規則が無く、追加の対処は要らなかったが、それは測って
分かったことである。

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件、テスト 34 件も通る
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 9 個が true / false で完全一致（`build` が `src` の宣言 emit のみで
  あることを確認したうえで、`dist/` を消して exit code も確認）

## `ts-codemod-cli` の opt-in（2026-09-01 実測）

**型エラー 1 件・lint 2 件。** どちらも `scripts/cmd/sync-cli-versions.mts` の
1 ファイルに集中しており、素の lib でも通る形に直せた。

### 4 つ測って、直すところがあるものを選んだ

| パッケージ                    |  型 | lint | 内容                        |
| :---------------------------- | --: | ---: | :-------------------------- |
| `synstate-preact-hooks`       |   0 |    1 | `String(error)`（117 行目） |
| `synstate-preact-signals`     |   0 |    1 | 同上（**同じ行番号**）      |
| `synstate-react-hooks-compat` |   0 |    1 | 同上（**同じ行番号**）      |
| `ts-codemod-cli`              |   1 |    2 | 下記 ← 採用                 |

上 3 つは `scripts/cmd/embed-examples-in-jsdoc.mts` の **117 行 60 桁**という
同じ位置である。このスクリプトを持つパッケージすべてに同じ行があり、
opt-in のたびに 1 件ずつ出てくる。

### 型エラー 1 件 — `replaceAll` のキャプチャ群（3 度目）

`ts-repo-utils`（#1618）・`ts-codemod-lib`（#1747）と同じパターン。ここは
キャプチャが 3 つあるので、可変長引数で受けてから 3 つとも `isString` で
絞り、1 つでも外れたらマッチした文字列をそのまま返す。3 つとも省略可能では
ないので、この分岐は実際には通らない。

### lint 2 件 — `String(...)`

同じファイルの `String(error)` と `String(cliFilesResult.value)`。どちらも
`unknown` なので `unknownToString`。

**`String(...)` の置き換えはこれで 7 件目・8 件目になる。** リポジトリ全体では
`embed-examples-in-jsdoc.mts` に少なくとも 7 箇所、`build.mts` に 1 箇所、
`sync-cli-versions.mts` に 2 箇所残っていた計算になる。

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 2 個が true / false で完全一致。このパッケージの `build` は
  `configs/tsconfig.build.json`（`include` は `../src`）で宣言のみ emit し、
  全スコープの type-check は走らせないので、`github-settings-as-code`
  （#1757）で踏んだ罠には当たらない。それでも `dist/` を消して exit code を
  見る手順で確認した

## `eslint-plugin-ts-data-forge` の opt-in（2026-09-01 実測）

**型エラー 0 件・lint 4 件。** うち 3 件は既知の `String(...)` だが、
**1 件はこれまでに出ていない指摘**だった。

### 4 つ測って、内容の違うものを選んだ

| パッケージ                    |  型 | lint | 内容                                       |
| :---------------------------- | --: | ---: | :----------------------------------------- |
| `eslint-config-typed`         |   5 |    5 | 型 5 件は #1745 が既に直しているものと同一 |
| `eslint-plugin-ts-data-forge` |   0 |    4 | ← 採用                                     |
| `eslint-plugin-ts-fortress`   |   0 |    3 | `String` 2 ＋ 下記の `never` 1             |
| `eslint-plugin-ts-type-forge` |   0 |    2 | `String` 2                                 |

`eslint-config-typed` の型 5 件は、`ts-data-forge` の opt-in（#1745）で
`prefer-nullish-coalescing-when-safe.mts` に見つけたものと同じである。
**#1745 が入れば消えるので、ここでは触っていない。**

### `includes` の型述語が false 側も絞る

`prefer-canonical-length-cast.mts` で

```ts
if (rewrite.keep.includes(index)) return [];
const next = node.arguments[index + 1]; // index が never
```

strict lib は `includes` をこう宣言している。

```ts
includes(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): searchElement is T;
```

**型述語なので、TypeScript は false 側にも適用する。** `keep` は
`readonly number[]`（`T = number`）で `index` も `number` なので、早期 return の
あとの `index` は `Exclude<number, number>` = `never` になる。

`includes` が `false` を返す意味は「**この配列に無い**」であって「この型で
ない」ではないので、述語としては強すぎる。ただしこの宣言は
`KEYS.includes(s)` でリテラル union に絞れるようにするためのもので、
狙いは分かる。**上流に報告する価値のある挙動**である。

**直し方: `index` を使う行を guard の前へ動かした。** `some` に置き換える手も
あるが、今度は `unicorn/prefer-includes` が `includes` に戻せと言う — #1756 の
`-1 * n` と同じ、規則同士が打ち消し合う形になる。読み書きの順序を変えるだけなら
どちらの規則にも触れず、素の lib でも同じに読める。

**`eslint-plugin-ts-fortress` にも同じ 1 件がある**（`prefer-canonical-length-constrained-type.mts`）。
同じ直し方が効くはずである。

### lint 3 件 — `String(...)`

`build.mts` の `String(result.value)`（`unknown` → `unknownToString`）、
`gen-rule-types.mts` の `String(rule.deprecated)`（`boolean` なので
`.toString()`）、`prefer-range-for-loop.mts` の `String(stepNum)`
（`typeof` で `number` に絞り込み済みなので `.toString()`）。
**これで 10〜12 件目**になる。

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件、テスト 316 件も通る
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 29 個が true / false で完全一致（`dist/` を消して exit code を確認）
- `tsconfig.json` の `include` に `./test` が無かったので足した。`files` は
  `src` と `dist` なので公開されない
- **probe を足したあとに lint を測り直す。** このパッケージにも
  `ts-data-forge`（#1745）と同じ「テストファイルは export してはならない」
  規則があり、probe の `export` に当たる。probe を置く前に lint を通して
  「0 件」と思い込むと、`ws:lint` で初めて落ちる。`#1745` と同じく、その
  ブロックの `ignores` に 1 件加えて対象外にした

## `eslint-config-typed` の opt-in（2026-09-01 実測）

**型エラー 0 件・lint 5 件。** #1762 で「型 5 件」と測ったが、その 5 件は
`ts-data-forge` の opt-in（#1745）が直したものだった。**#1745 がマージされた
いま、実測で 0 件**である。

`prefer-nullish-coalescing-when-safe.mts` の `new Set([...])` に型引数を足す
修正で、`ts-data-forge` 側の opt-in から見つかったもの。**consumer の opt-in
が別パッケージの型エラーを先に潰す**という順序があり得ることの実例になった。

### lint 5 件 — `String` / `Boolean`

| 箇所                                                                      | 直し方                                                  |
| :------------------------------------------------------------------------ | :------------------------------------------------------ |
| `scripts/gen-eslint-rules/apply-codemod.mts`                              | `String(error)` → `unknownToString`                     |
| `scripts/.../print/meta-to-string.mts`                                    | `Boolean(x)` → `x === true`                             |
| `src/plugins/react-coding-style/.../component-name.mts`                   | `String(pattern)` → `pattern.toString()`（`RegExp`）    |
| `src/plugins/ts-restrictions/.../check-destructuring-completeness.mts` ×2 | `String(v)` → `v.toString()`（`number` に絞り込み済み） |

`Boolean(x)` の 1 件だけは意味が変わり得る。読んでいるのは ESLint の rule
metadata の `requiresTypeChecking` で、真偽値のフラグなので `=== true` が
意図どおりであり、truthy な非 boolean を true と扱わなくなるぶん厳しくなる。

### 不要になった `eslint-disable` 18 件 — `ws:lint` では見えない

`vitest-globals.d.ts` の
`// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types`
22 件のうち **18 件が opt-in で不要になる**。`modifier: Function` に付いていた
ものがそれで、strict lib の `Function` は `prototype` ・ `length` ・
`arguments` ・ `caller` を `readonly` で宣言しているため、
`prefer-readonly-parameter-types` が鳴らなくなる。残る 4 件は
`errorLike?: ErrorConstructor | Error | null` に付いたもので、これは変わらない。

**これは `ws:lint` では落ちない。** `reportUnusedDisableDirectives: true` の
既定の重大度は warning で、`eslint .` は exit 0 のまま「0 件」と報告する。
一方 CI の `type-check (ws:lint:fix)` は `--fix` で 18 件を消し、そのあとの
`z:assert-repo-is-clean` が dirty で落ちる。**lint の実測は `ws:lint` ではなく
`ws:lint:fix` + `z:assert-repo-is-clean` で行うこと。** #1761 はこれで落ちた。

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件、テスト 583 件も通る
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 168 個が true / false で完全一致（`dist/` を消して exit code も確認）
- probe を置いてから lint を測った
- `ws:lint:fix` のあと `z:assert-repo-is-clean` が通る

## `synstate-preact-hooks` の opt-in（2026-09-01 実測）

**型エラー 0 件・lint 1 件。** 内容は #1752 で測ったとおり
`scripts/cmd/embed-examples-in-jsdoc.mts` の `String(error)`（117 行 60 桁）
1 件で、`unknownToString` に置き換えた。**リポジトリ内 9 件目**である。

`.d.mts` 9 個が true / false で完全一致。#1757 を踏まえ、このパッケージの
`build` が `configs/tsconfig.build.json`（`include` は `../src`）で宣言のみ
emit することを先に確認したうえで、`dist/` を消して exit code を見る手順で
測っている。

## `synstate` 本体の opt-in は保留（2026-09-01 調査）

**型エラー 12 件。うち 6 件は `src/`、6 件は `samples/docs-site/why-reactive/`。**
`src/` の 6 件は直せたが、samples の 6 件は**ドキュメントの判断**になるので、
ここでは opt-in していない。

### `src/` の 6 件は `TimerId` 1 箇所に集約される

`counter.mts` ・ `timer.mts` ・ `audit.mts` ・ `debounce.mts` ・ `throttle.mts` の
`clearInterval` / `clearTimeout` 呼び出しがすべて落ちる。原因は

```ts
export type TimerId = ReturnType<typeof setTimeout>;
```

である。**DOM lib と `@types/node` の両方が `setTimeout` を宣言する**ので
`typeof setTimeout` はオーバーロード集合になり、`ReturnType` は最後のシグネチャ
だけを読む。strict lib 下ではその結果が `{} | null` になり、
`clearInterval(id: number | undefined)` に渡せない。

**「何が消せるか」で定義するほうが安定する。**

```ts
export type TimerId = NonNullable<Parameters<typeof clearTimeout>[0]>;
```

`clearTimeout` はどちらの lib でもシグネチャが 1 つなので `Parameters` は
曖昧にならない。`NonNullable` は「消す側が許容するが handle ではない」
`undefined` を落とすためのもの。この 1 行で `src/` の 6 件は消える（実測）。

### samples の 6 件は直せるが、直すと docs が変わる

`why-reactive/03-react-debounce-fetch.tsx` と `05-imperative-table.mts`
（および `ja/` の対）は、**わざと素朴に書いた命令型のコード**で、
`generate-sample-diffs.mts` がドキュメントへそのまま埋め込む。

strict lib では `Response.json()` が `any` ではなく `unknown` を返すため、
`setResults(data)` ・ `error.name` ・ `allRows = await …json()` が落ちる。
**strict lib の言い分は正しい。** ただし直すには

- 表示されるコードに型注釈やキャストを足す（読者に見えるものが変わる）か、
- 型ガード／`ts-fortress` の検証を足す（サンプルの主題である debounce や
  「命令型はつらい」から目を逸らさせる）

のどちらかになる。これは型安全性ではなく**ドキュメントの判断**なので、
勝手に決めずに残した。samples がそのままでよいと決まれば、`TimerId` の 1 行と
合わせて opt-in できる。

## `synstate-preact-signals` の opt-in（2026-09-01 実測）

**型エラー 0 件・lint 1 件。** #1752 で測ったとおり、
`scripts/cmd/embed-examples-in-jsdoc.mts` の 117 行 60 桁の `String(error)`
1 件だけ。**15 件目**。

残るのは `synstate-react-hooks-compat` の同じ 1 件で、これも同じ位置である。

### `embed-examples-in-jsdoc.mts` の重複について

このスクリプトを持つパッケージすべてに同じ行があり、opt-in のたびに 1 件ずつ
出てくる。これまでに直したのは

`ts-repo-utils` ・ `ts-fortress` ・ `ts-data-forge` ・ `synstate-react-hooks`
・ `synstate-preact-hooks` ・ 本パッケージ

の 6 つで、`synstate-react-hooks-compat` が残っている。**まとめて 1 つの PR で
潰す価値はあるが、opt-in と混ぜないほうが読みやすい**ので、ここまでは
opt-in のたびに 1 件ずつ直してきた。

### 確認したこと

- `libReplacement: true` で type-check・lint とも 0 件、テスト 25 件も通る
- `libReplacement: false` にすると **probe だけ**が `TS2578` で落ちる
- `.d.mts` 8 個が true / false で完全一致
- `pnpm run doc` も通る
- probe を置いてから lint を測った

## `numeric-input-utils` の opt-in（2026-09-01）

13 パッケージ目、`apps/` 側の 2 つ目。**型・lint とも初回から 0 件**で、
直すところが無かった。

`tsconfig.json` に `compilerOptions` が無いのは #1784 と同じ。
`test/` も無いので probe 用に作って `include` に足してある。

**このパッケージには `test` スクリプトが無い**が、probe は型レベルの表明で
`tsc` が見るものなので、ランナーは要らない。`libReplacement` を `false` に
戻すと probe の `TS2578` だけが出ることは確認済み。

## `lambda-calculus-interpreter-core` の opt-in（2026-09-01）

15 パッケージ目、`apps/` 側の 4 つ目。44 ファイルあるが**型・lint とも初回から
0 件**だった。テストは 5 ファイル 11 件通過。

### `apps/` の残りをまとめて測っておいた

#1786 で「依存の opt-in 状況を先に見ておくとよい」と書いたので、
候補 5 つを先に測った。

| パッケージ                         |                                        main の上での型エラー |
| :--------------------------------- | -----------------------------------------------------------: |
| `tiny-router-observable`           | 6（全部 `libs/synstate` の中 → #1786 で #1781 の上に積んだ） |
| `resize-observer-react-hooks`      |                                                            0 |
| `react-utils`                      |                                                            0 |
| `poll-discord-app`                 |                                                            0 |
| `lambda-calculus-interpreter-core` |                                                   0（本 PR） |

**測ってから選ぶと、`synstate` 待ちの 1 つを先に見分けられる。**
残る `apps/` のうち `event-schedule-app` ・ `event-schedule-app-styled` 系は
まだ測っていない。

### `test/` を作る対象がまた 1 つ

`include` は `./src` ・ `./scripts` ・ `./configs` だけだったので、
`./test` を足して probe を置いた。このパッケージには `test` スクリプトが
あるが、vitest の `include` は `src/**/*.test.mts` なので probe は拾われない
（拾われても型レベルの表明なので実行するものが無い）。

## `react-utils` の opt-in（2026-09-01）

19 パッケージ目、`apps/` 側の 8 つ目。**型・lint とも初回から 0 件**。

`tsconfig.json` の `paths` で `better-react-use-state` をソースから解決して
いるので、#1786 で書いたとおり**依存のソースにも strict lib が適用される**。
それでも 0 件だったので、`libs/better-react-use-state`（#1755 で opt-in 中）の
ソースは既に strict lib で通ることが分かる。**依存の opt-in を待つ必要は無い。**

`apps/` の残りは以下のとおりで、いずれも自前の修正は要らない。

| パッケージ                                                                                               | 状況                          |
| :------------------------------------------------------------------------------------------------------- | :---------------------------- |
| `react-utils-styled` ・ `tiny-router-react-hooks` ・ `resize-observer-react-hooks` ・ `poll-discord-app` | 0 件（`main` の上でそのまま） |
| `event-schedule-app-shared`                                                                              | 1 件、#1784 待ち              |
| `lambda-calculus-interpreter-react`                                                                      | 6 件、#1781 待ち              |

## `poll-discord-app` の opt-in（2026-09-01）

20 パッケージ目、`apps/` 側の 9 つ目。**型・lint とも初回から 0 件**。

`tsconfig.node-only.json` を継承する Node 側のアプリで、`discord.js` と
`fs` / `path` を直接使うが、strict lib で落ちるところは無かった。
**`apps/` で `paths` を一切持たない最初のパッケージ**でもあり、
依存のソースを巻き込まないぶん測定は素直だった。

`tsconfig.json` に `compilerOptions` が無かったのでブロックごと足し、
`test/` を作って `include` に加えてある。`test` スクリプトは無い。

## `react-utils-styled` の opt-in（2026-09-01）

21 パッケージ目、`apps/` 側の 10 個目。**型・lint とも初回から 0 件**。

`paths` で `react-utils` ・ `resize-observer-react-hooks` ・
`better-react-use-state` の**3 つをソースから解決している**が、それでも 0 件
だった。#1791（`react-utils`）と同じで、**依存のソースを巻き込んでも
エラーが出ないなら、その依存の opt-in を待つ必要は無い**。

`apps/` 側でソース解決した依存が問題になったのは、結局
`libs/synstate`（#1786 ・ #1789 ・ #1790）と
`apps/ts-fortress-types`（#1788 ・ #1790）の 2 つだけだった。

## `resize-observer-react-hooks` の opt-in（2026-09-01）

22 パッケージ目、`apps/` 側の 11 個目。**型・lint とも初回から 0 件**。

`ResizeObserver` と `DOMRect` を直接扱うパッケージだが、strict lib で
落ちるところは無かった。`better-react-use-state` をソース解決している点は
#1791 ・ #1793 と同じで、やはり待つ必要は無い。

## `tiny-router-react-hooks` の opt-in（2026-09-01）

23 パッケージ目、`apps/` 側の 12 個目。**型・lint とも初回から 0 件**。

### `apps/` 側で「自分の PR だけで完結する」ものはこれで終わり

残り 3 つは**いずれも他の PR が入るのを待つ状態**で、自前の修正は無い。

| パッケージ                          | 件数 | 待っている PR                   |
| :---------------------------------- | ---: | :------------------------------ |
| `event-schedule-app-shared`         |    1 | #1784（`ts-fortress-types`）    |
| `lambda-calculus-interpreter-react` |    6 | #1781（`synstate`）             |
| `libs/ts-std-forge`                 |    2 | #1751（`toExponential` の下限） |

`apps/` 12 個のうち **10 個が初回から 0 件**、自前の修正が要ったのは
`synstate-docs`（#1789）と `event-schedule-app`（#1790）の 2 つだけだった。
`libs/` 側と違って `apps/` は**移行作業がほとんど不要**で、
`paths` によるソース解決の連鎖だけが実質的な依存関係になっている。

## `ts-std-forge` の opt-in（2026-09-01）

26 パッケージ目。**これで opt-in の残りは無い。**

### 詰まっていたのは #1751 の土台が古かったことだけだった

`main` の上で opt-in すると型エラーが 2 件出る。どちらも
`toExponential` の `fractionDigits` の下限で、#1751 が直しているもの。

これまで「#1751 の上に積むとかえって増える（2 件 → 4 件）」と報告してきたが、
原因は**#1751 のブランチが `main` より前を土台にしていて、そこでは
`ts-std-forge` のソース自体が古い**ことだった。#1751 を現在の `main` に
載せ替えると**衝突なく通り**、`ts-std-forge` の opt-in は 0 件になる。

本 PR には #1751 のコミットを `main` に載せ替えたものを含めてある。
**#1751 のブランチには触っていない。** #1751 が先に入れば、同じ patch なので
rebase 時に自然に落ちる。

### 数値の下限は API の正しさの問題でもあった

`ts-std-forge` 自身は `toExponential(fractionDigits?: UintRangeInclusive<0, 100>)`
と宣言していて、**strict lib 側の `1..100` のほうが誤り**だった
（ECMA-262 は 0 を許す。`(1).toExponential(0)` は `'1e+0'`）。
`ts-std-forge` 側を `1..100` に狭めて回避することもできたが、
それは API を間違った側に合わせることになるので採らなかった。

テストは 4 ファイル 72 件通過。

## `synstate` の opt-in（2026-09-01）

11 パッケージ目。#1761 で保留にしていた本体で、**残っていた 12 件のうち
6 件が `src/`、6 件が `samples/docs-site/why-reactive/` にあった。**

### `src/` の 6 件は `TimerId` の定義 1 つで消えた

```ts
// 修正前
export type TimerId = ReturnType<typeof setTimeout>;
// 修正後
export type TimerId = NonNullable<Parameters<typeof clearTimeout>[0]>;
```

strict lib では `setTimeout` の戻り値が `{} | null` で、`clearTimeout` の
引数は `number | undefined`。**両者は同じ型ではない**ので、
「`setTimeout` が返すもの」で定義すると `clearTimeout` に渡せない。
この型の用途はすべて `clearTimeout` / `clearInterval` に渡すことなので、
**消費側で定義するのが正しい**。`counter` ・ `timer` ・ `audit` ・
`debounce` ・ `throttle` の 6 件がこれ 1 つで通った。

### samples は「読者に見える部分」を 1 文字も変えずに済んだ

`why-reactive` の samples はわざと素朴に書いた命令型コードで、
strict lib では `Response.json()` が `any` ではなく `unknown` を返すため
`setResults(data)` ・ `error.name` ・ `allRows = await …json()` が落ちる。

直すと**ドキュメントに埋め込まれるコードが変わってしまう**ため #1761 では
保留にしたが、**埋め込みスクリプトに逃げ道があった**。
`libs/synstate/scripts/cmd/embed-examples-utils.mts` は

```ts
const ignoreLineKeywords = [
    '/* embed-sample-code-ignore-this-line */',
    '// transformer-ignore-next-line',
] as const;
```

で始まる行を**丸ごと落としてから**埋め込む。そこで

```tsx
/* embed-sample-code-ignore-this-line */ // @ts-expect-error …
setResults(data);
```

と置いた。`pnpm run doc` を掛け直しても **`.md` は 1 バイトも変わらない**
（変わるのは en↔ja の同期用に生成している `.diff` だけで、これは
ドキュメントからは参照されていない保守用の生成物）。

**サンプルをどう直すかという編集上の判断は、そのまま残してある。**
今のコードは「strict lib はここを咎めるが、素朴なままにしてある」ことを
記録しているだけなので、後から実際に直す判断をしても衝突しない。

### tsconfig を分ける案は採れない

`samples/` だけ strict lib の対象外にする案は、
`eslint-config-typed` が `parserOptions.project` に**単一の tsconfig 名**を
渡す（`projectService` ではない）ため、samples を `include` から外すと
型情報つき lint が動かなくなる。samples は
`files: ['samples/**']` で実際に lint されている。

### lint は 44 件生えた — うち 41 件が `String()`

型が 0 件になった後で lint を測ると 44 件だった（opt-in 前は 0 件）。
41 件は `String(x)` の非推奨で、ベンチマークスクリプトに集中している。
単純な識別子は `x.toString()`、catch した値は `unknownToString(error)`
（リポジトリ内 10 件目）。

残り 3 件は samples の `r.json() as Promise<readonly Row[]>` が
`total-functions/no-unsafe-type-assertion` に当たるもの。
strict lib では `unknown` からのキャストになるため。これも同じ
ignore-this-line で抑えてある — 読者に見えるコードはキャストのままで、
それが実際に読者が書くものだから。

## `synstate-docs` の opt-in（2026-09-01）

17 パッケージ目、`apps/` 側の 6 つ目。**#1781（`synstate`）の上に積んである。**
`apps/` の中で**自前の修正が要った唯一のパッケージ**（#1788 の表を参照）。

### `Array.prototype.length` は readonly になる

型エラーは 8 件のうち 6 件が `libs/synstate`（#1781 で解決済み）、
残る 2 件が自前の mobx adapter 2 つで、どちらも同じ形だった。

```ts
mut_disposers.length = 0;
//            ^^^^^^ Cannot assign to 'length' because it is a read-only property
```

**配列の切り詰めを代入で書く慣用句が通らなくなる。** strict lib の言い分は
正しく、これは型で防げる変更のはずのもの。

### ルールとライブラリが正面から衝突した

`.splice(0)` に替えると **`unicorn/no-unnecessary-splice` が
「`.length = 0` を使え」と言う** — strict lib が禁じたまさにその書き方を
ルールが要求する。これまでに見つけたルール同士の衝突（#1756 ・ #1762 ・
#1769 ・ #1770 ・ #1783）と違い、**ルール対ライブラリ**の衝突になる。

`const` を `let` にして束縛ごと差し替えると両方を満たす。

```ts
let mut_disposers: (() => void)[] = [];
// …
mut_disposers = [];
```

`mut_` 接頭辞があるので `functional/no-let` も通る。

### lint 55 件はすべて `String()`

SVG 属性に数値を埋めるための `String(x)` が 55 箇所あった。
`x.toString()`（単純な識別子・メンバ）と `(expr).toString()`（式）に機械変換。
リポジトリ内で `String()` の非推奨を潰したのは #1774 ・ #1781 に続いて 3 度目で、
**今回が最大**。

## `ts-fortress-types` の opt-in（2026-09-01）

12 パッケージ目。**`apps/` 側では最初の 1 つ。**

### `apps/` はまだ 1 つも opt-in していなかった

`libs/` に出した 12 本の PR で `libs/` 側はほぼ埋まったが、
`libReplacement` を持たないパッケージを数え直すと **`apps/` 側 14 個が
どの PR にも入っていなかった**。issue #1737 の「29 個が未宣言」には
`apps/` も含まれている。

### `tsconfig.json` に `compilerOptions` が無い場合がある

このパッケージの `tsconfig.json` は `extends` と `include` だけで、
`compilerOptions` を持っていなかった。`libs/` 側は全部持っていたので、
`apps/` を進めるときは**ブロックごと足す**必要がある。

### `Date` の月引数は 0 始まりで、strict lib はそれを型で言う

型エラーは 1 件だけだった。

```ts
// month: MonthEnum（1–12）
new Date(year, month - 1, date, hours, minutes);
```

strict lib は `Date` の第 2 引数を `Index<12>`（0–11）と宣言する。
`month - 1` は `MonthEnum` に対しては必ず 0–11 だが、**減算は `number` に
広がる**ので通らない。アサーションで潰さず、12 行の対応表

```ts
const monthToIndex = {
    1: 0,
    /* … */ 12: 11,
} as const satisfies ReadonlyRecord<MonthEnum, Index<12>>;
```

を書いて `monthToIndex[month]` にした。**strict lib の言い分が正しく、
移植元が「0 始まり」を減算で表現していたのを型で表現し直した**形になる。

### probe の置き場が無いパッケージがある

`test/` が無く、`include` も `./src` ・ `./scripts` ・ `./configs` だけだった。
`test/strict-lib-active.mts` を置いて `include` に `./test` を足してある
（probe を持つ既存 2 パッケージと同じ形）。`src/` に置くと barrel に載って
しまうので避けた。

`libReplacement` を `false` に戻すと probe の `TS2578` だけが出る。
テストは 5 ファイル 15 件通過。

## `react-blueprintjs-utils` の opt-in（2026-09-01）

16 パッケージ目、`apps/` 側の 5 つ目。**#1784（`ts-fortress-types`）の上に
積んである。**

### `apps/` 側の型エラーは、ほぼ全部が依存のソースから来る

残り 9 個を先に測ったところ、**自分のコードにエラーがあるのは 1 つだけ**だった。

| パッケージ                             | 型エラー | 出どころ                                           |
| :------------------------------------- | -------: | :------------------------------------------------- |
| `react-utils-styled`                   |        0 | —                                                  |
| `tiny-router-react-hooks`              |        0 | —                                                  |
| `resize-observer-react-hooks`          |        0 | —                                                  |
| `react-utils`                          |        0 | —                                                  |
| `poll-discord-app`                     |        0 | —                                                  |
| **`react-blueprintjs-utils`（本 PR）** |    **1** | `apps/ts-fortress-types`（#1784）                  |
| `event-schedule-app-shared`            |        1 | `apps/ts-fortress-types`（#1784）                  |
| `lambda-calculus-interpreter-react`    |        6 | `libs/synstate`（#1781）                           |
| `synstate-docs`                        |        8 | 6 が `libs/synstate`、**2 が自前**（mobx adapter） |

`apps/` は private でビルド成果物を持たないので、`tsconfig.json` の `paths` で
依存を**ソースから**解決する。opt-in するとその依存のソースにも strict lib が
適用されるため、**エラーの件数は「そのパッケージの仕事量」ではない**。

先に測って出どころを見ておけば、直すべき PR の上に積むだけで済む。
`synstate-docs` だけが自前の修正を要する。

### 本 PR は積み替えただけ

1 件のエラーは #1784 で直した `Date` の月引数の件で、そのまま
`ts-fortress-types` の opt-in の上に載せると 0 件になる。**消費側から見て
#1784 の修正が効いていることの裏取りにもなっている。**

## `event-schedule-app` の opt-in（2026-09-01）

18 パッケージ目、`apps/` 側の 7 つ目。**#1781（`synstate`）と #1784
（`ts-fortress-types`）の両方が要る**ので、2 つを一直線に積み直した上に載せた。

型エラー 9 件のうち 6 件が `libs/synstate`、1 件が `ts-fortress-types`、
**2 件が自前**だった。

### `Date` の「0 日目」の慣用句が通らなくなる

```ts
// 翌月の 0 日目 = 前月の最終日
const lastDay = new Date(year, month, 0);
//                                    ^ Argument of type '0' is not assignable
//                                      to parameter of type 'DateEnum | undefined'
```

strict lib は `Date` の**日引数を `DateEnum`（1-31）に絞る**ので、
広く使われるこの書き方そのものが弾かれる。月引数も 0-11 なので、
12 月を表す番号 12 も渡せない。

**ECMA-262 は範囲外の値を繰り上げると明記しているので、元のコードは正しい。**
strict lib が厳しすぎる側の例で、#1782（PixiJS）や #1789
（`no-unnecessary-splice`）と同じく「ライブラリの言い分が常に正しいとは
限らない」ケースになる。

ここでは `Date` を経由せず算術で書き直した。月ごとの日数は閏年の 2 月しか
変わらないので `switch` 一つで済み、**既存の
`as StrictExtract<DateEnum, 28 | 29 | 30 | 31>` も落とせた**。

`getFirstDateOfMonth` のほうは `DateUtils.create`（#1784 で月を 1-12 で
受けるようにしたもの）に置き換えるだけで済んだ。

### `Response.json()` の `unknown` はここにも出る

`fetch-holidays.mts` の `res.json() as Promise<…>` が
`total-functions/no-unsafe-type-assertion` に当たる。#1781 の samples と
同じ話だが、あちらと違ってドキュメントに埋め込まれるコードではないので、
理由を書いた `eslint-disable-next-line` にしてある。検証を足すと
想定外データでの挙動が変わるため。
