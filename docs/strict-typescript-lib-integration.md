<!-- cspell:ignore ENOENT -->

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

**`temp/`・`diff-from-prev/`・`lib-files/`・`output/diff/` は残す。** 連続バージョン間の
差分は、**converter script の更新が要るかどうかを判断するための機構**として置かれて
いる。publish されるアセットには含まれないが、開発には要る。

`gen-version-diff.mts` が読む先を見れば依存関係がはっきりする。

| 差分の種類          | 入力                                             | 出力                                |
| :------------------ | :----------------------------------------------- | :---------------------------------- |
| `official`          | `temp/copied`（TypeScript 本体からのコピー原本） | `diff-from-prev/official/`          |
| `converted`         | `output/lib-files`                               | `diff-from-prev/converted/`         |
| `converted-branded` | `output-branded/lib-files`                       | `diff-from-prev/converted-branded/` |

つまり `temp/copied` は**入力**であり、追跡をやめると `official` 差分が取れなくなる。
「TypeScript 側が何を変えたか」が見えなくなるということで、それは converter を追随
させるかどうかの一次情報である。`output/diff/`（変換前後の差分、108 ファイル）も
同じ性質のものとして残す。

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
