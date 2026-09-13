---
title: 'AI coding 促進とサプライチェーン攻撃対策のための開発環境整備'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['typescript', 'pnpm', 'eslint', 'githubactions', 'monorepo']
published: false
---

TypeScript リポジトリを前提に、**AI coding の促進**と**サプライチェーン攻撃対策**の両面から開発環境をどう整えるかをまとめます。

この二つは直接には関係のない、別のテーマです。一緒に扱うのは、**どちらも「今」必要になった**という点が共通しているからです。AI によって攻撃側のコストも下がり、同時に自分たちがコードと依存を増やす速度も上がりました。どちらも、以前なら後回しにできた整備かもしれませんが、今はそのコストに見合うリターンがある時代になってきています。

具体例は筆者の monorepo で実際に運用しているものです。設定ファイルはすべて公開されているので、詳細はそちらを参照してください。

https://github.com/noshiro-pf/mono

:::message
**箇条書きだけを読めば方針が分かる**ように書いています。実装の詳細・設定例・踏んだ落とし穴は折り畳みに入れてあるので、必要なものだけ開いてください。
:::

## サプライチェーン攻撃の対策

### 依存の取り込みを遅らせる

- **pnpm `minimumReleaseAge` で新しいリリースを一定期間待つ。** 筆者は `10080`（7 日）に設定しています。悪意あるバージョンは大半が数時間で検出・撤回されるので、ゼロデイ攻撃の大半を避けられます。
- **install script はデフォルト拒否。** pnpm の `allowBuilds`（旧 `onlyBuiltDependencies`）で明示的に許可したものだけ実行します。postinstall は攻撃の主要経路で、しかも多くの依存では実際には不要です。
- **lockfile に URL 依存を入れない。** pnpm は推移的依存の URL は弾きますが、直接依存は通します。`pnpm-lock.yaml` を走査して落とすスクリプトを CI に置きます。
- **CI の install は必ず `pnpm install --frozen-lockfile`。**
- **`packageManager` フィールドで pnpm 自体のバージョンも固定する。**

:::details minimumReleaseAgeExclude の書き方 — 固定バージョン指定・自動棚卸し・族ごと除外

- 例外は `minimumReleaseAgeExclude` に書きます。自作パッケージは `'@my-org/**'` のようにワイルドカードで通します。
- リリース直後の外部パッケージを安全性確認の上で入れたいときは `foo@1.2.3` と**バージョン付き**で書きます。例外がそのリリースだけに限定され、後続バージョンには波及しません。
- **`minimumReleaseAgeExcludePrune: true` を併せて入れておくと、例外リストが自動で棚卸しされます**（pnpm 11.21 以降、デフォルトは `false`）。

  ```yaml
  # pnpm-workspace.yaml
  minimumReleaseAge: 10080 # = 7 days
  minimumReleaseAgeExcludePrune: true
  minimumReleaseAgeExclude:
    - '@my-org/**' # 恒久的な除外。prune されない
    - foo@1.2.3 # 一時的な除外。foo@1.2.4 以降が入ると自動で消える
  ```

  - `install` / `add` / `update` / `remove` / `dedupe` のたびに、**新しく書かれた lockfile がもう解決しないエントリを削除**します。`foo@1.2.3` のような固定バージョンの例外は `foo@1.2.4` 以降が入った時点で勝手に消えるので、**一時的な例外を消し忘れて恒久化する**ということが起きません。
  - `@my-org/**` のような**名前パターンは常に残る**ので、恒久的な除外が消える心配はありません。「一時的な例外はバージョン付き、恒久的な除外はパターン」という書き分けが、そのまま prune の挙動と一致します。
  - `sharedWorkspaceLockfile: false` のときは prune がスキップされます。lockfile がワークスペース全体を覆っていないと、他のプロジェクトがまだ必要としているエントリを stale と誤判定するためです。

- **同じ型定義を共有するパッケージ族は族ごと除外します。** 一部だけ通すと新旧 2 バージョンが同じツリーに入り、型が壊れます。筆者は `@octokit/**` で実際に踏みました（`@octokit/openapi-types` だけが通り、それに対して `expectType<..., '='>` で厳密一致を表明していたパッケージがビルドできなくなった）。

:::

:::details minimumReleaseAge を何日に設定すべきか

考慮すべきこと

- アカウント乗っ取り等で公開直後のバージョンにマルウェアが仕込まれるケース
  - 検知速度の実績値
    - Shai-Hulud 攻撃は約12時間で検知された
    - 2025年9月の debug/chalk への攻撃は約2.5時間で収束
      → つまり1日のクールダウンでどちらもブロックできたことになります。 https://mondoo.com/blog/npm-supply-chain-security-package-manager-defenses-2026
  - npm レジストリは通常、影響を受けたバージョンを数時間以内に削除するため、悪意あるリリースの生存期間は短いのが実態。この認識を反映して、
    pnpm 11 ではデフォルトが24時間に設定された（https://pnpm.io/supply-chain-security）。
- 意図せず混入した通常の脆弱性(CVE)は発見までに数週間〜数年かかるのが普通なので、7日待とうが30日待とうがほぼ防げない。

セキュリティパッチとのトレードオフ

- `minimumReleaseAge` を長めに設定するデメリットは、正規のセキュリティ修正の受け取りが遅れること
- minimumReleaseAgeExclude を使えば緊急のホットフィックスやセキュリティパッチなど特定のパッケージだけ待機期間をバイパス可能なので、セキュリティアラートを別の形で検知する運用を組めばこのデメリットは抑えられる。

---

以上を踏まえての設定案

- 〇 1日: マルウェアの大半(数時間で検知されるもの)をブロック。エコシステムの新デフォルト。
- 〇 3〜7日: 検知が遅れたケース(数日かかった事例もある)への保険。7日はこのレンジの上限で、追加コストは更新遅延のみ。
- × 7日超: 限界効用がほぼゼロ。寝かせ型攻撃には日数では対抗できない。

:::

### バージョン固定

- **公開ライブラリの `dependencies` / `peerDependencies` は `^`にする。** ここは利用者から見た API の一部なので、完全固定すると利用者のツリーで同一ライブラリの複数バージョンが同居してしまいます。
- **アプリケーションの依存と `devDependencies` は完全固定（`^` 無し）。** monorepo なら pnpm の `catalog:` でバージョンを pnpm-workspace.yaml 1 ファイルに集約できます。
- **GitHub Actions の `uses` は commit hash で固定。** これは規約ではなく**GitHub 側の設定**（Actions settings の `sha_pinning_required`）で強制できます。
- **固定した pin は日次の更新 workflow で動かす**ので、固定は塩漬けを意味しません（次節）。

:::details 書き方（catalog / SHA ピン）

`catalog:` は各 workspace 側にバージョンを書きません。

```jsonc
// libs/foo/package.json
{ "devDependencies": { "eslint": "catalog:" } }
```

```yaml
# pnpm-workspace.yaml
catalog:
  eslint: 10.9.1
```

Actions の SHA ピンはコメントでバージョンを添えます。Dependabot も pnpm も、更新時に `# v7.0.1` の部分まで追随して書き換えてくれます。

```yml
steps:
  - name: Checkout
    uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
```

`pnpm update --include-github-actions` で pnpm からも更新できます（pnpm 11.16.0 以降）。

:::

### 依存更新の自動化

- **Dependabot をやめ、日次の自前 workflow 1 本にまとめました。** 理由は運用コストです。Dependabot は依存ごとに PR を作るので、merge 待ちの PR が常時大量に溜まり、 merge 作業に手間がかかることに不満がありました。 1 本の PR にまとめ、`pnpm self-update` などの付随する更新も一括で行うようにしたことで運用コストが大幅に下がりました。 `minimumReleaseAge` 設定も関連しますが、セキュリティパッチを迅速に適用するという意味でも依存更新の運用コスト低減には価値があります。
- **Actions のメジャー更新だけは人間が判断する。** Actions 側の更新コマンドには `--latest` を付けないようにしています。これは主に **pnpm による Actions 更新には `minimumReleaseAge` が現状効かない**（[pnpm#13923](https://github.com/pnpm/pnpm/issues/13923)）ためで、 npm 依存と更新タイミングが合わず壊れた経験があったためです[^hold-github-action-major]。
  - **「npm 依存は pnpm、GitHub Actions だけ Dependabot」は現状アリな構成**だと思います。

[^hold-github-action-major]: https://github.com/noshiro-pf/mono/pull/1608

:::details 自前 workflow の中身

- `pnpm update --latest`（npm 依存）→ `pnpm update --include-github-actions`（Actions のピン）→ `pnpm self-update` → 1 本の PR を作って auto-merge。
- ブランチ名は**日付を含まない固定名**にして、毎回 main から作り直して force-push。古い PR が溜まらず、常に main にリベースされた状態になります。
- Changesets 運用なら、runtime 依存が動いた publish 対象パッケージに patch changeset を自動付与します。
- Actions のメジャーを人間に委ねる理由は、**workflow ファイルの変更が PR の CI で検証されないことがある**からです。筆者は `changesets/action` v2 が無人マージされ、main で `release.yml` が壊れました。npm 依存なら「新しいバージョンで CI が落ちる」で気付けますが、リリース用 workflow は PR では動きません。

:::

:::details cooldown が効かない理由と、Dependabot 側の制約

- pnpm は Actions のバージョンを `git ls-remote` の ref 一覧（タグ名と SHA）から取っており、**タグには公開日時が無い**ので、そもそも age を判定する材料がありません。数時間前のタグでもそのまま取ります。
- **Dependabot は GitHub API 経由で解決するため、タグが指すコミットの日時（および Release の公開日時）を読めます。** これが `package-ecosystem: 'github-actions'` にも `cooldown` を設定できる理由です。2026 年 7 月からは全エコシステムでデフォルト 3 日の cooldown も入りました。
- ただし Dependabot 側にも制約があります。
  - 現状の実装は **Release の公開日ではなくタグのコミット日時**を見ているため、先にタグを打って後からリリースする運用だと直感と合いません（[dependabot-core#13078](https://github.com/dependabot/dependabot-core/issues/13078)）。
  - cooldown 判定が最新リリースしか見ないため、リリース頻度の高い action が永久に更新されなくなります（[#13691](https://github.com/dependabot/dependabot-core/issues/13691)）。
- 筆者は現状、major version の更新だけを拒否して workflow が壊れないようにするに留めています。いずれ pnpm 一本に統一できるでしょう。

:::

### 権限とシークレット

- **PAT（Personal Access Token）を一切使わず、GitHub App のインストールトークンを都度発行する。**
  - PAT は**長命**です。一度ログや環境変数のダンプに出てしまえば、気付いて revoke するまでの間ずっと悪用できます。GitHub App のインストールトークンは **1 時間で失効**するので、漏洩したときの被害の窓が桁違いに小さくなります。
- **workflow の `permissions:` は job 単位で最小化する。**
- **`actions/checkout` は `persist-credentials: false`。** トークンを git config に残さず、push が必要な箇所だけその場でトークンを埋めた remote URL を使います。
- **トークンの発行は `pnpm install` の後に行う。** 許可した install script が動く前に、鍵を job に持ち込ませないためです。
- **fork からの PR は workflow 実行に承認を要求する**（`fork_pr_contributor_approval_policy`）。
- **secret scanning と push protection を有効にする**（後述のとおり、リポジトリ設定として宣言・バージョン管理します）。

:::details PAT をやめて GitHub App にする生存期間以外の理由

- 発行時に**リポジトリと権限を絞れます**（「contents: write と pull-requests: write だけ」など）。PAT は fine-grained でも人間のアカウントに紐づいた静的な権限セットで、workflow ごとに絞ることはできません。
- **個人アカウントに紐づかない**ので、退職・権限変更・アカウント停止で CI が突然壊れることがなく、監査ログ上も「誰の代理か」ではなく App の操作として残ります。
- なお、`GITHUB_TOKEN` で push したコミットは workflow を起動しないという仕様があるため、「自動生成した PR で CI を回したい」場合は結局 App トークンが要ります。

:::

### 公開（publish）

- **npm trusted publishing（OIDC）を使い、長期の npm token を持たない。** workflow 側は `id-token: write` だけで済みます[^first-publish]。
- **公開する成果物そのものを検証する。** `pnpm pack` した tarball を隔離したワークスペースに install し、実際に import して動かすスモークテストを CI に置きます。ソースに対する lint や型検査では「publish すると壊れている」を捕まえられません。

[^first-publish]: 初回 publish だけは手動です。npm 上にパッケージが存在しないと trusted publishing を設定できないため。

:::details 検証環境を「宣言していない依存が解決しない」状態に保つ

- パッケージごとに**独立した project** + `hoist: false` + **外部を拒否する resolve hook** を敷きます。
- 最後のものが一番重要です。 repo 内に検証用ディレクトリを置くと、何もしなければ Node がリポジトリの `node_modules` まで探しに行って、**ソースからビルドされた自作ライブラリを見つけてしまいます。** それでは「利用者環境の再現」になりません。
- 公開済みバージョンを pin した検証も併走させると、リリース事故が「無関係なブランチが急に落ちる」ではなく**pin の差分**として現れます。

:::

## AI coding

**AI がミスしたり好ましくない実装をする可能性を極力排除し、レビューコストを下げるには、静的検証で徹底的に縛るべきです。**

「人間がレビューで気づく」に頼っているものを、順に機械のチェックへ移していく、という考え方です。

### 型と Lint の強化

- **Linter ルールを強化する。** 後発の高速な linter も色々出ていますが、筆者は現状 ESLint を使い続けています。決定的な理由は **bulk-suppressions** と**カスタムルールの表現力**の二つです（詳細は下記）。
- **strict な標準ライブラリ型定義を入れる。** TypeScript 公式の標準ライブラリは `JSON.parse` の結果が `any`、型注釈無しの `new Map()` が `Map<any, any>` になるなど、そのままでは危険です。  
  筆者は TypeScript の lib 型定義をより厳格にした [`strict-ts-lib`](https://www.npmjs.com/package/strict-ts-lib-v7.0) というライブラリを開発・公開しており、現時点で TypeScript v5.0〜7.0 までサポートしています。
  - `compilerOptions.libReplacement: true` で読み込んで有効化します。これは TypeScript が公式に提供しているコンパイラオプションです。
  - 関連研究: https://github.com/uhyo/better-typescript-lib

https://www.npmjs.com/package/strict-ts-lib-v7.0

- tsconfig の **`strict`**, **`noUncheckedIndexedAccess` などの strict 系オプションを全部入れる。**
- **型レベルテストでランタイムテストと二重に固める。** 型が意図せず広がったことをテストとして検出できます。
  - 筆者が開発している [ts-data-forge](https://github.com/noshiro-pf/mono/tree/ts-data-forge%4014.7.0/libs/ts-data-forge#1-compile-time-type-assertions-with-expecttype) というライブラリの `expectType` というユーティリティで実現できます。使い方はリポジトリのテストコード等を参照してください。

:::details ESLint を使い続ける二つの理由

**1. [bulk-suppressions](https://eslint.org/docs/latest/use/suppressions) に相当する機能を持つ linter が他に存在しない**（2026 年 9 月調査時点）

業務のコードなど「静的検証を強化したいが急激な書き換えは難しい」場合に、**既存コードは抑制したまま新規コードにだけ強い制限を掛ける**というのは、これ以外の手段で叶えるのが困難です。個別の `eslint-disable` を撒く必要もありません。

Biome にも Oxlint にも要望は上がっていますが（[biome#8691](https://github.com/biomejs/biome/discussions/8691) / [oxc#10549](https://github.com/oxc-project/oxc/issues/10549)）、抑制情報を専用ファイルに書き出す形はまだ実装されていません。Biome の `--suppress` は**ソースに `biome-ignore` コメントを撒く**ものなので、目的は果たせても差分の性質が違います[^suppress-vs-ignore]。

**2. 十分な表現力でカスタムルールを実装できる**[^flat-config]

AI を使えばカスタム lint ルールの実装は容易で、これによって AI が書くコードを縛るのは経験上非常に有効です。AI coding 時代にカスタムルールが書けないデメリットは吞めません。

Biome も 2.0 以降 [GritQL プラグイン](https://biomejs.dev/linter/plugins/)でカスタムルールを書けますが、GritQL は独自のパターンマッチ DSL で、公開 API は `register_diagnostic()` 程度、**型情報は使えず**、TypeScript の型を見て判断するルール（「この引数は readonly か」など）は現状書けません。JS/TS プラグインは [2026 年のロードマップ](https://biomejs.dev/blog/roadmap-2026/)に載っている段階です[^biome]。Oxlint の JS Plugin は JavaScript で書けるので、この点では Biome より筆者の用途に近いです。

[^suppress-vs-ignore]: suppress は将来的に修正されるべきである、という明確な意思表示となります。個別 ignore は「偽陽性であることが分かっている」という意図なのか、エラーを一時的に黙らせているだけなのかを区別しづらいです（偽陽性なら disable コメントを必須にする、という運用は可能でしょうが、機械的に強制しづらいです）。

[^flat-config]: ESLint v9 以降の Flat Config なら、ESM で書いた `eslint.config.mjs` にルール実装をコードとして import して使うことも容易です。ビルドも publish も要りません。Oxlint でも同様のことが実現できることを確認しました。

[^biome]: `biome lint --unsafe` などのコマンドがあったり、ルールをグループ化しているところからも、ルールを中央集権的に管理しようとする思想は感じます。GritQL プラグインという形で外部拡張の口は開いたものの、型情報を渡さない syntax レベルに留めているあたりにも、その思想は表れているように個人的には思います。

### 構造の制約

- **import 関係の制約を linter で定義する。** 循環（`import-x/no-cycle`）とレイヤ違反（`import-x/no-restricted-paths`、例:「`utils/` は `components/` を import しない」）。業務では `import-layer-order` という**カスタムルールを自作**し、`src/` 直下のディレクトリ間の依存方向が一方向になっていることを保証しています。
- **ファイル拡張子の統一をスクリプトで検査する。**「`src/` 配下は `.mts` と `.tsx` だけ」のような制約です（`.ts` / `.mts` / `.cts`、`.yml` / `.yaml` の混在を防ぐ）。
- **package.json の依存記述の過不足を両方向から検査する。** import しているものが宣言されているか（ESLint `import-x/no-extraneous-dependencies`）と、宣言されているものが使われているか（**knip**）。前述の pin 方針を満たしているかも同様に検査できます。
- **公開物だけの追加検査を別に走らせる。** `src/` が devDependency を import していれば、それは壊れた publish です。
- **codemod を CI で流して差分チェックする。** 筆者は `convert-to-readonly`（型を readonly 化）と `append-as-const` を常時適用しており、ignore directive を書いた箇所以外はすべて readonly 化が強制されます。

:::details `import-layer-order` の設計

- `layers` オプションに**基礎的なものから順にディレクトリを一列に並べます**（例: `src/utils` < `src/store` < `src/hooks` < `src/components`）。
- 各ファイルは「マッチするパス prefix が最も長い」レイヤーに分類します。ファイルが属するレイヤーより**上位のレイヤーを import していたら違反**。同一レイヤー内は許容、どのレイヤーにも属さないものは対象外です。
- エントリーポイントのように全レイヤーを束ねる必要があるファイルは `exemptFiles` で除外します。相対 import と `~/` エイリアスの両方を解決します。
- 実装は `ImportDeclaration` / `ExportNamedDeclaration` / `ExportAllDeclaration` を見るだけで 200 行程度です。**AI に書かせれば半日仕事**で、「AI がレイヤーを無視した import を書く」という頻出の問題が構造的に消えます。OSS 化してもよさそうですが未実施です。

:::

:::details 公開物専用の検査をどう書くか（落とし穴 6 つ）

- 通常の lint とは**別の ESLint 実行**（専用の設定ファイル）として走らせます。同じ `import-x/no-extraneous-dependencies` を、対象を `<pkg>/src/**` に絞ったうえで `devDependencies: false` / `peerDependencies: true` で使うだけです。通常の pass はテストやスクリプトも見るので、そこで devDependency を禁止するわけにはいきません。
- `packageDir` は**パッケージ 1 つだけ**を指定した設定オブジェクトを、パッケージごとに生成します。まとめて渡すと「どこかのパッケージが宣言していれば全パッケージで通る」になってしまいます。
- `includeTypes: true` を付けます。型だけの import も、ソースを同梱して publish するなら利用者側で解決されるためです。
- `linterOptions.noInlineConfig: true` にして、ファイル内の `eslint-disable` で緩められないようにします。
- 型定義しか無いパッケージは既定の resolver で解決できず**黙ってスキップされる**ので、`import-x/resolver: { typescript: true }` が要ります。これを設定するまで 1 件見逃していました。
- ついでに `eslint.config.mts` 自身もこの pass で見ています。共有 ESLint 設定は自分自身を ignore することが多く、**lint 設定ファイルの import だけ誰も検査していない**状態になりがちだからです。

筆者のリポジトリでは、この検査を入れた時点で既に 2 パッケージが「利用者環境では壊れる」状態で publish されていました。

:::

:::details 常時適用している codemod

`convert-to-readonly`、`append-as-const` のほか、`replace-any-with-unknown`、`replace-record-with-unknown-record`、`convert-interface-to-type`、`enable-no-unchecked-indexed-access` などがあります。

https://github.com/noshiro-pf/mono/tree/main/libs/ts-codemod-lib

:::

### 「生成 → 差分チェック」を型として使う

生成物と生成元がずれるのを防ぐ、最も効く形です。**CI で生成コマンドを実行し、`git diff` が出たら落とす。** 筆者の環境では以下がすべてこの形になっています。

- formatter（Prettier / oxfmt）
- index barrel の生成
- README への sample コード埋め込み・TypeDoc
- 依存グラフのドキュメント
- codemod
- リポジトリ設定のバックアップ（後述）
- 公開済みパッケージの pin

その他、markdownlint と cspell でドキュメントのフォーマット・スペルも見ます。

:::message
このパターンを増やすほど、AI に「生成物を手で書き換える」余地が無くなります。生成物を直接編集する変更は必ず CI で落ちるので、生成元を直すしかなくなる、というのが効き目の本体です。
:::

:::details 派生形 — 単一の情報源から導出し、一致をチェックする

筆者は Node.js のサポートバージョンを 1 つの JSON にまとめ、`engines.node`・`volta.node`・CI の互換性マトリクスをそこから派生させています。

**`engines.node`（利用者への約束）・テスト対象の LTS・開発環境のバージョンは全部別物**です。これを混同した変更——「EOL だからサポート下限を上げる」、下限を上げるのは破壊的変更です——は AI がやりがちなので、チェックで縛る価値があります。

:::

:::details 生成スクリプト側の注意 — 既に正しいファイルを書き換えない

内容を比較してから書き、書くときは一時ファイルへの書き込み + `rename` で原子的に置き換えます。

筆者は barrel 生成器が毎回全ファイルを書き直していたせいで、**並列ビルド中に別パッケージがそのファイルを import して落ちる**という事故を起こしました（`SyntaxError: ... does not provide an export named ...`）。

:::

### リポジトリ設定のコード化

- **branch protection / ruleset / Actions settings / Pages などを gh CLI（GitHub API）で dump し、`repo-settings/` に JSON で置く。**
- **「宣言（望ましい状態）」と「現状のミラー」を分けて持ち、CI で現状をミラーと突き合わせる。** GUI での不審な設定変更が差分として出ます。
- 筆者が入れている主な設定は、main への merge は squash のみ・linear history 必須・force push 禁止、および `strict_required_status_checks_policy`（main の tip を含んだ head でチェックが通っていること）。

筆者は自作の [github-settings-as-code](https://github.com/noshiro-pf/mono/tree/main/libs/github-settings-as-code) でこれを行っていますが、**workflow の中に `gh` + `jq` で直接書いても同じことができます。**

:::details `gh` + `jq` だけで書く場合（と、落とし穴 3 つ）

```yaml
- name: Dump the live settings
  env:
    # GITHUB_TOKEN ではなく GitHub App のトークン。理由は後述。
    GH_TOKEN: ${{ steps.app-token.outputs.token }}
    REPO: ${{ github.repository }}
  run: |
    set -euo pipefail
    mkdir -p repo-settings/{repository-settings,rulesets,actions-settings,pages}/bk

    # 1. リポジトリ設定。pushed_at や *_count のような揮発するフィールドを
    #    含めると毎回差分が出るので、見たいキーだけを jq で抜く。
    #    -S でキー順も固定する（API の返す順は保証されない）。
    gh api "repos/${REPO}" | jq -S '{
      has_issues, has_projects, has_wiki,
      allow_squash_merge, allow_rebase_merge, allow_merge_commit,
      allow_auto_merge, delete_branch_on_merge, allow_update_branch,
      squash_merge_commit_title, squash_merge_commit_message,
      web_commit_signoff_required, security_and_analysis
    }' > repo-settings/repository-settings/bk/settings.json

    # 2. ruleset。一覧 API は rules を返さないので、id で 1 件ずつ引き直す。
    gh api "repos/${REPO}/rulesets" --jq '.[].id' | while read -r id; do
      gh api "repos/${REPO}/rulesets/${id}" > /tmp/ruleset.json
      name="$(jq -r .name /tmp/ruleset.json)"
      jq -S '{id, name, target, enforcement, bypass_actors, conditions, rules}' \
        /tmp/ruleset.json > "repo-settings/rulesets/bk/${name}.json"
    done

    # 3. Actions 設定。SHA ピン強制と fork PR の承認ポリシーは別エンドポイント。
    gh api "repos/${REPO}/actions/permissions" > /tmp/perm.json
    gh api "repos/${REPO}/actions/permissions/fork-pr-contributor-approval" > /tmp/fork.json
    jq -s -S '.[0] * .[1]' /tmp/perm.json /tmp/fork.json \
      > repo-settings/actions-settings/bk/settings.json

    # 4. Pages。有効化していないと 404 なので握りつぶす。
    if gh api "repos/${REPO}/pages" > /tmp/pages.json 2>/dev/null; then
      jq -S '{build_type, source, https_enforced}' /tmp/pages.json \
        > repo-settings/pages/bk/settings.json
    fi

- name: Fail if the live settings drifted
  run: |
    if [ -n "$(git status --porcelain -- repo-settings/)" ]; then
      git --no-pager diff -- repo-settings/
      git status --porcelain -- repo-settings/
      echo '::error::Repository settings drifted from the committed backup.'
      exit 1
    fi
```

実際に運用して分かった落とし穴が 3 つあります。

- **`GITHUB_TOKEN` では読めません。** workflow の `permissions:` に `administration` というスコープは存在せず、リポジトリ設定と ruleset はそこに属します。GitHub App のインストールトークンが必要です。
- **しかも `administration: read` では足りません。** read だと merge 関連の設定と ruleset の `bypass_actors` が API から返らず、「空の差分」ではなく「キーが消えた差分」が出ます。`permission-administration: write` が要ります。
- **全 PR でこのチェックを走らせてはいけません。** 比較対象は「リポジトリの現在の設定」であって、ブランチが変更できるものではありません。誰かが Web UI で設定を変えると、**関係のない open PR が全部赤くなり、しかもその PR の作者には直しようがありません**（実際にやりました）。main では常に走らせ、ブランチでは `repo-settings/` を触ったときだけ走らせます。
  - その判定は **merge base との比較**で行います。main 側のバックアップがブランチを切った後に動いていると、two-dot diff は「このブランチが変更した」と誤判定し、古いファイルに対してチェックを走らせて落とします。

:::

### 必須チェックは「集約 job 1 つ」にする

- **required status check には matrix の各エントリではなく、`needs:` で matrix を待って結果を判定するだけの集約 job 1 つを登録する。**
- 主な理由は **ruleset の整備コスト**です。required status check は**チェック名の文字列一致**なので、matrix エントリを直接登録していると**チェックを 1 つ追加するたびに ruleset 側にも名前を足す 2 箇所の編集**が要ります。集約 job 方式ならコマンドを追加しても `repo-settings/` に差分は出ず、**追加した瞬間からマージをブロックする条件として機能します。**
- **集約 job は `if: always()` にする。** そうしないと matrix と一緒にスキップされ、報告自体が消えます。

:::details 2 箇所編集を忘れると何が起きるか / 副次的に塞がる穴

**忘れると「実行され、報告され、しかし何もブロックしない」チェックができます。** 筆者のリポジトリでは 4 つそうなっていて、そのうち 3 つは「生成 → 差分チェック」型、つまり**生成物が生成元とずれたまま main に入るのを防ぐはずのチェック**でした。

**副次的に穴も 1 つ塞がります。** matrix エントリを直接 required にしていると、job ごとスキップされたときに**古い success が残ったまま**になります（skip された job は matrix を展開しないので、名前が上書きされない）。実測では、green だった PR に `[WIP]` ラベルを付けた後も 22 個の matrix チェックが success のままでした。集約 job は matrix を持たないので名前が安定し、必ず最新の run で上書きされます。

:::

### CI 実行時間

チェックを増やすほど CI 時間が問題になるので、削る仕組みを最初から入れておきます。

- **差分ゲート。** 変更パスがそのチェックの読む範囲に無ければスキップします。**step 単位ではなく job 単位**にするのが要点で、そうしないと matrix の全 runner が「やることが無い」と判断するためだけに起動します。
- **`concurrency` + `cancel-in-progress`** で、連続 push の古い run を捨てる。
- **main への push では原則何も走らせない。** squash merge の tree は PR の head と同一で、既に検査済みだからです。
- **out-of-date（main より遅れている）ブランチでもスキップする。** `strict_required_status_checks_policy` を掛けている以上そのままではマージできず、rebase すれば `synchronize` で全部走り直すので、その前の run の結果は誰も使えません。
- **「まだ CI を回さなくていい PR」の判定に draft を使わない。** ラベル（または PR title）で判定すべきです。
- **merge queue が使えない環境では、ローカルスクリプトで代用できる。**

:::details draft を判定軸にしない理由と、マージを止める仕組み

**draft / open は GitHub の公式機能として CODEOWNERS へのレビュー依頼が飛ぶかどうかと紐づいています。** これを「CI を実行するか否か」の軸に流用すると、**「CI は回したいが CODEOWNERS へのレビュー依頼はまだ飛ばしたくない」**という状況に対応できません。

筆者は `[WIP]` ラベルで判定しています。ラベルはイベントのペイロードに乗るので API 問い合わせが要らず、job レベルの `if` で判定できるため runner が 1 台も起動しません。

- **トリガーに `labeled` と `unlabeled` の両方を入れる**のを忘れずに。`unlabeled` が無いと、ラベルを外しても push 済みコミットに対してチェックが走り直しません。逆に言えば、**ラベルを外すことが「CI を回してくれ」の合図**になり、空コミットを積む必要がなくなります。
- **スキップとマージブロックは別物です。** skipped は required status check を満たしてしまうので、ラベルが付いている間マージを止める仕組みが別に要ります。筆者は **`pending` の commit status** を head コミットに書いています。
- job の失敗ではなく status の `pending` にするのが要点です。job は success / failure / skipped / cancelled しか返せず、前二つはマージを止められないか、あるいは「まだ準備できていない PR」を「壊れている」と表現することになります。実際 failure でやっていた時期は、PR 一覧に赤 × が出て、push とラベル操作のたびに失敗メールが飛びました。`pending` なら意味が正確で、マージも同様に止まり、通知は飛びません。

:::

:::details merge queue の代替スクリプト

個人アカウントの無料プランでは merge queue が使えないため、ローカルで走らせるスクリプトで代用しています。

- 「auto-merge 有効 & `[WIP]` ラベル無し」の PR を列挙し、**out-of-date のものを 1 つずつ** rebase して push → CI が通れば auto-merge に任せる、を繰り返すだけです。マージ自体はスクリプトではなく GitHub の auto-merge が行います。
- 前述の「out-of-date ブランチでは CI をスキップ」と組み合わせると、**同時に CI が走るのは常に 1 本**になります。3 本並行で rebase すると、1 本がマージされた瞬間に残り 2 本が out-of-date になり、その分の CI 実行が丸ごと無駄になります。
- rebase は使い捨ての `git worktree` で行うので、作業中のチェックアウトを汚しません。

:::

### まだやっていないこと

- CodeQL、`dependency-review-action`、OSV スキャンなどの脆弱性検査は未導入。

## monorepo vs 個別 repo

社内 private repository の多くは monorepo にまとめた方が開発効率が向上する、と筆者は考えています。社内 monorepo は巨大なごった煮で良く、Google も Meta も意味的まとまりで分けてはいません。

### monorepo のメリット

- **ユーティリティ等の共通化切り出しが容易**で、かつ**共通ライブラリの利用アプリケーション側がそのままテストとして即日機能する**（publish 後に install して初めてバグに気づく、を防ぎやすい）。
- **開発環境ツール（type checker, linter, formatter, …）の設定を共通化しやすい。** pnpm `catalog:` で devDependencies のバージョンを統一でき、依存更新のメンテナンスコストが 1 repo に集約されます。eslint config や tsconfig も共通化でき、legacy config が放置されにくくなります。
- **GitHub Actions workflow の共通化が容易。** ただし CI 実行時間が長くなるので、差分ゲート・`[WIP]` ラベル・concurrency など「無駄な実行を省く整備」が前提になります（前述）。
- **`CLAUDE.md` 等の AI 向け規約ドキュメントを整備しやすい。**「1 リポジトリ、1 規約ファイル」が一番確実です[^agent-config]。
- **個々のリポジトリに適用するとコストが掛かって渋ってしまうような開発環境改善を、1 回の投資で全体に適用できる。** チェックやコード自動生成の強化は AI coding のために積極的に行うべきで、ここが一番効きます。
- **サプライチェーン対策の設定**（`minimumReleaseAge`、`allowBuilds`、Actions の SHA 固定、更新 workflow）も 1 箇所で済む。

[^agent-config]: 筆者は以前、共有リポジトリから規約を vendoring して各リポジトリに配る生成器を持っていましたが、同期が追いつかず実際に差分が発生していました。統合後は生成器ごと捨てて 1 ファイルにしています。チェックを増やすたびに「なぜそうしているか」を同じファイルに書き足していけるのも大きく、AI が善意で設定を"直して"しまうのを防げます。

### 個別 repo でしか実現できないこと

- **リポジトリ単位でしか存在しない GitHub 機能。** テンプレートフラグ、star / watch / fork の粒度、リポジトリ単位の Discussions と topic 検索。
- **権限の分離。**
- **譲渡・アーカイブ・削除の単位。**
- **外部コントリビュータの参入障壁**（public repo のみ該当）。

一言でまとめると、**個別 repo の利点は主に社会的・制度的なもの、monorepo の利点は開発ループの最適化**です。移行コストは小さくないので、どちらを取るかは組織ごとの判断になります。

## 導入順序（低コスト順）

1. `minimumReleaseAge` と `allowBuilds`、Actions の SHA 固定 — 設定を数行書くだけ。
2. 依存更新の自動化 workflow — 1 で固定した pin を動かし続けるために必須。
3. formatter / linter の「生成 → 差分チェック」化 — 既存違反は bulk-suppressions で先送りできる。
4. リポジトリ設定の dump とドリフト検知。
5. 依存宣言の過不足チェック（`no-extraneous-dependencies` / knip）。
6. strict な標準ライブラリ型定義と codemod — package 単位で段階的に。
7. PAT の廃止と GitHub App 化、publish の trusted publishing 化、成果物スモークテスト。
8. プロジェクト固有のカスタム lint ルール — ここまで来ると、AI に「このリポジトリでやってはいけないこと」を都度説明する必要がほぼ無くなります。
