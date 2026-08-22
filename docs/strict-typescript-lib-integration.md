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

`libReplacement: true` は `octokit-safe-types` と、この PR で足す
`ts-repo-utils` の 2 つ。残りの opt-in は従来の順序（`ts-fortress` →
`ts-type-forge` → `ts-data-forge`）で進める。`paths` は全パッケージに入って
いるので、各パッケージで足すのは `"libReplacement": true` の 1 行だけになった。

## `ts-repo-utils` の opt-in（2026-08-14 実測）

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
| `String` が `@deprecated`（lint 7 件、下記）   | `unknownToString`（`ts-data-forge`）に置き換える |

3 つ目は元々このリポジトリの慣例で、`gen-docs.mts` などは既に
`unknownToString` を使っていた。strict lib の `@deprecated` は、その慣例が
徹底されていない箇所を挙げてくれたことになる。`String(x)` と違って
`[object Object]` にならないので、置き換えは実質的な改善でもある。

**ただし、この 7 件が lint に出たのは旧レイアウトでの測定である。** bundle へ
移ったいま ESLint は strict lib を見ておらず（次節）、この指摘はもう出ない。
置き換え自体は慣例どおりなので残した。

2 つ目は strict lib の言い分が正しい。省略可能なグループは不参加のとき
`undefined` になるので、`string` と決めつけられない。ここでは 3 つとも必須なので
絞り込みが実際に落ちることはないが、型の上では書く必要がある。

### 確認したこと

opt-in のたびに、次の 2 つを確認する。

- **標準 lib でも型チェックが通る**こと（`libReplacement` を一時的に `false` に
  して `tsc --noEmit`）。`src` を配るパッケージでは、これが崩れると消費者の
  エディタが赤くなる
- **`dist` が変わらない**こと。両方の lib でビルドして `diff -r` を取る。
  `ts-repo-utils` では差分なしだった

### ESLint は strict lib を見ていない（2026-08-22 実測）

**`tsc` と ESLint が別のライブラリを見る。** 型チェックは
`typescript-native`（TypeScript 7）で走り、`paths` 経由で strict lib を読む。
ESLint の型情報は `typescript`（6.0.3）が作るプログラムから来るが、**こちらの
lib 置き換えは `paths` を見ない**。`--traceResolution` がそう言っている。

```text
======== Resolving module '@typescript/lib-es2020' from '…/__lib_node_modules_lookup_lib.es2020.d.ts__.ts'. ========
Explicitly specified module resolution kind: 'Node10'.
Loading module '@typescript/lib-es2020' from 'node_modules' folder, …
======== Module name '@typescript/lib-es2020' was not resolved. ========
```

`Node10` 固定の node_modules 探索で、`paths` を参照する経路が無い。107 個を
個別パッケージとして配っていた頃は `publicHoistPattern` で
`node_modules/@typescript/` に並んでいたので**名前で**引けていた。bundle は
`paths` でしか届かないので、ESLint からは見えなくなった。

結果として:

- **型チェックは strict lib、lint は素の lib** で走る。同じコードに対して
  `tsc` は `JSON.parse` を `JsonValue`、ESLint は `any` と見る
- したがって `@typescript-eslint/no-unsafe-assignment` の
  `eslint-disable` は **opt-in 後も要る**。消すと lint が落ちる
  （`get-workspace-packages.mts` で実測）
- 逆に、**「型チェック以外への影響」節の lint 21 件（`ts-fortress`）はもう
  起きない**。`@typescript-eslint/no-deprecated` が strict lib の
  `@deprecated` を読めないため。opt-in の見積りは型エラーだけでよくなった
- `lint:fix` が strict lib 前提のコードに書き換えることも、同じ理由で起きない

**どちらの lib でも通る形に書く**という方針は、この差のぶんだけ実際に必要に
なる。`src` を配るパッケージでは元々そうすべきで、方針は変わらない。

揃えたいなら方法は 2 つあるが、どちらも今は採らない。`node_modules/@typescript/`
へ実体を並べ直すのは URL 配布時代の `publicHoistPattern` に戻ることになるし、
TypeScript 6 側が lib 置き換えで `paths` を見るようになるのを待つ手もあるが、
待つ理由が弱い。
