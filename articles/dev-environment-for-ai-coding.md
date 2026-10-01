---
title: 'AI coding 促進とサプライチェーン攻撃対策のための開発環境整備'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['typescript', 'pnpm', 'eslint', 'githubactions', 'monorepo']
published: false
---

<!-- cspell:ignore Shai Hulud -->

TypeScript リポジトリを前提に、**AI coding の促進**と**サプライチェーン攻撃対策**の両面から開発環境をどう整えるかをまとめます。

この二つは直接には関係のない、別のテーマです。一緒に扱うのは、**どちらも「今」必要になった**という点が共通しているからです。AI によって攻撃側のコストも下がり、同時に自分たちがコードと依存を増やす速度も上がりました。どちらも、以前なら後回しにできた整備かもしれませんが、今はそのコストに見合うリターンがある時代になってきています。

検証や実測は筆者の monorepo で行ったものですが、**他のリポジトリに持ち出せる形**に絞って書いています。

https://github.com/noshiro-pf/mono

:::message
**箇条書きだけを読めば方針が分かる**ように書いています。設定例・ツールの挙動・踏んだ落とし穴は折り畳みに入れてあるので、必要なものだけ開いてください。
:::

## サプライチェーン攻撃の対策

### 依存の取り込みを遅らせる

- **pnpm `minimumReleaseAge` で新しいリリースを一定期間待つ。** 悪意あるバージョンは大半が数時間で検出・撤回されるので、待つだけでゼロデイ攻撃の大半を避けられます。
- **install script はデフォルト拒否。** pnpm の `allowBuilds`（旧 `onlyBuiltDependencies`）で明示的に許可したものだけ実行します。postinstall は攻撃の主要経路で、しかも多くの依存では実際には不要です。
- **lockfile に URL 依存を入れない。** pnpm は推移的依存の URL は弾きますが、直接依存は通します。lockfile を走査して落とすスクリプトを CI に置きます。
- **CI の install は必ず `--frozen-lockfile`。**
- **`packageManager` フィールドでパッケージマネージャ自体のバージョンも固定する。**

:::details minimumReleaseAgeExclude は「方針」ではなく「期限付き waiver」として書く

**除外エントリを名前だけで書くと、そのパッケージは以後ずっと隔離を素通りします。** 追加した理由が解消しても誰も気づきません。**バージョンまで書き、`minimumReleaseAgeExcludePrune: true` で失効させる**のが正解です（prune は pnpm 11.21 以降、デフォルトは `false`）。

```yaml
# pnpm-workspace.yaml
minimumReleaseAge: 10080 # = 7 days
minimumReleaseAgeExcludePrune: true
minimumReleaseAgeExclude:
  # 緊急で入れたいものはバージョンまで書く。次のバージョンが入った時点で消える
  - foo@1.2.3
```

**実測した prune の挙動（pnpm 12.3.4）。設定名からは読み取れないものが 3 つあります。**

|                       |                                                       |
| :-------------------- | :---------------------------------------------------- |
| 発火                  | **`pnpm install` では走らない。`pnpm update` で走る** |
| `name` / `name@1.2.3` | lockfile が解決しなくなれば**削除**                   |
| `pattern-*`（glob）   | **常に残る**                                          |

**つまり glob で書くと永久に失効しません。** リストの目的と逆なので、glob は使わず全件バージョン固定にするのが良いです。なお `sharedWorkspaceLockfile: false` のときは prune 自体がスキップされます（他プロジェクトがまだ必要とするエントリを stale と誤判定するため）。

**例外を残す場合も、理由は「隔離の免除」ではないはずです。** 例えば「同じ型定義を共有するパッケージ族が揃って動かないと型が壊れる」ケースは、要求が**族の原子性**であって免除ではありません。バージョンを固定しておけば、族が次に揃って動いた時点で prune が落とします。

:::

:::details minimumReleaseAge を何日に設定すべきか

考慮すべきこと

- アカウント乗っ取り等で公開直後のバージョンにマルウェアが仕込まれるケース
  - 検知速度の実績値
    - Shai-Hulud 攻撃は約 12 時間で検知された
    - 2025 年 9 月の debug/chalk への攻撃は約 2.5 時間で収束
      → つまり 1 日のクールダウンでどちらもブロックできたことになります。 https://mondoo.com/blog/npm-supply-chain-security-package-manager-defenses-2026
  - npm レジストリは通常、影響を受けたバージョンを数時間以内に削除するため、悪意あるリリースの生存期間は短いのが実態。この認識を反映して、pnpm 11 ではデフォルトが 24 時間に設定された（https://pnpm.io/supply-chain-security）。
- 意図せず混入した通常の脆弱性 (CVE) は発見までに数週間〜数年かかるのが普通なので、7 日待とうが 30 日待とうがほぼ防げない。

セキュリティパッチとのトレードオフ

- `minimumReleaseAge` を長めに設定するデメリットは、正規のセキュリティ修正の受け取りが遅れること
- `minimumReleaseAgeExclude` を使えば緊急のホットフィックスやセキュリティパッチなど特定のパッケージだけ待機期間をバイパス可能なので、セキュリティアラートを別の形で検知する運用を組めばこのデメリットは抑えられる。

---

以上を踏まえての設定案

- 〇 1 日: マルウェアの大半 (数時間で検知されるもの) をブロック。エコシステムの新デフォルト。
- 〇 3〜7 日: 検知が遅れたケース (数日かかった事例もある) への保険。7 日はこのレンジの上限で、追加コストは更新遅延のみ。
- × 7 日超: 限界効用がほぼゼロ。寝かせ型攻撃には日数では対抗できない。

:::

### バージョン固定

- **公開ライブラリの `dependencies` / `peerDependencies` は `^` にする。** ここは利用者から見た API の一部なので、完全固定すると利用者のツリーで同一ライブラリの複数バージョンが同居してしまいます。
- **アプリケーションの依存と `devDependencies` は完全固定（`^` 無し）。** monorepo なら pnpm の `catalog:` でバージョンを 1 ファイルに集約できます。
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

:::

### 依存更新の自動化

- **依存ごとに PR を作らず、日次の 1 本にまとめる。** Dependabot の既定のように依存ごとに PR が立つと、merge 待ちが常時大量に溜まって運用コストが跳ね上がります。1 本にまとめ、パッケージマネージャ自体の更新など付随するものも一括で行うと大幅に下がります。**依存更新の運用コストを下げること自体が、セキュリティパッチを速く取り込むための投資**でもあります。
- **メジャー更新だけは人間が判断する。** 特に GitHub Actions は、更新タイミングが npm 依存と合わずに壊れることがあります[^hold-github-action-major]。
- **隔離が届かない更新経路を自分で塞ぐ。** パッケージマネージャの `minimumReleaseAge` は「レジストリからの取得」にしか効きません。**GitHub Actions のピン**と**パッケージマネージャ自身**は、その外側にあります。

[^hold-github-action-major]: https://github.com/noshiro-pf/mono/pull/1608

:::details 更新 workflow の組み方

- 依存更新 → Actions ピン更新 → パッケージマネージャ自身の更新 → 1 本の PR を作って auto-merge。
- **ブランチ名は日付を含まない固定名**にして、毎回デフォルトブランチから作り直して force-push します。古い PR が溜まらず、常にリベースされた状態が保てます。
- Changesets のようなリリース管理を併用しているなら、runtime 依存が動いた publish 対象パッケージへの changeset 生成も自動化しておきます。
- **メジャー更新を人間に委ねる理由は、workflow ファイルの変更が PR の CI で検証されないことがあるからです。** npm 依存なら「新しいバージョンで CI が落ちる」で気付けますが、リリース用 workflow のように PR では動かないものは、壊れていても PR 上では緑のままです。

:::

:::details 隔離が届かない 2 つの経路と、その塞ぎ方

**① GitHub Actions のピン。** pnpm の `--include-github-actions` に `minimumReleaseAge` は効きません（[pnpm#13923](https://github.com/pnpm/pnpm/issues/13923)）。pnpm は Actions のバージョンを `git ls-remote` の ref 一覧（タグ名と SHA）から取っており、**タグには公開日時が無い**ので、そもそも age を判定する材料がありません。数時間前のタグでもそのまま取ります。

**② パッケージマネージャ自身。** `pnpm self-update` は `minimumReleaseAge` を設計上無視し、`latest` を `packageManager` に書き込みます。書き換えるのはピンだけなので、**次のコマンドがそのバージョンをレジストリから取りにいき、そこでは保留が効きます。** 結果、保留より新しいリリースが出るたびに `self-update` は成功して 1 ステップ後に `ERR_PNPM_NO_MATURE_MATCHING_VERSION` で落ちる、という日次ジョブの死に方をします。

どちらも、自前スクリプトで同じ保留を適用すれば塞がります。

- **Actions**: `uses: owner/repo@<sha> # vX.Y.Z` のピンを、**同一メジャー内で保留より古い最新リリース**に動かします。日時は **Releases API の `published_at`** から取り（draft / prerelease は除外）、タグは Commits API で SHA に解決します。
- **パッケージマネージャ**: 保留が既に受け入れるバージョンを選んで `self-update <version>` に渡します。**除外リストに入れて済ませてはいけません** — ツリーの install スクリプトを全部実行する、唯一のパッケージだからです。

**Actions だけ Dependabot に任せる選択肢もあります。** Dependabot は GitHub API 経由で解決するので、`package-ecosystem: 'github-actions'` にも `cooldown` を設定できます（2026 年 7 月から全エコシステムでデフォルト 3 日）。ただし制約が 2 つあります。

- 現状の実装は **Release の公開日ではなくタグのコミット日時**を見ているため、先にタグを打って後からリリースする運用だと直感と合いません（[dependabot-core#13078](https://github.com/dependabot/dependabot-core/issues/13078)）。
- cooldown 判定が最新リリースしか見ないため、リリース頻度の高い action が永久に更新されなくなります（[#13691](https://github.com/dependabot/dependabot-core/issues/13691)）。

:::

### 権限とシークレット

- **PAT（Personal Access Token）を使わず、GitHub App のインストールトークンを都度発行する。** PAT は長命で、一度ログや環境変数のダンプに出れば revoke するまでずっと悪用できます。インストールトークンは **1 時間で失効**します。
- **鍵を持つ job は、作業ツリーから読んだものを実行してはならない。** 依存更新を自動化するなら、これが一番大事なルールです。`install` を走らせた job にトークンを持たせている限り、そのトークンは侵害された依存の射程内にあります。
- **workflow の `permissions:` は job 単位で最小化する。** リポジトリ既定は `read`、`can_approve_pull_request_reviews` は `false` に。
- **`actions/checkout` は `persist-credentials: false`。** トークンを git config に残さず、push が必要な箇所だけその場でトークンを埋めた remote URL を使います。
- **`git config core.hooksPath /dev/null`。** 依存の install スクリプトは `.git/hooks/pre-commit` を書けます。自動コミットする workflow なら必須です。
- **`.github/workflows/` を CODEOWNERS でマージゲートにする。** 無審査の auto-merge で細工した workflow がデフォルトブランチに届く経路を塞ぎます。
- **fork からの PR は workflow 実行に承認を要求する**（`fork_pr_contributor_approval_policy`）。
- **secret scanning と push protection を有効にする**（後述のとおり、リポジトリ設定として宣言・バージョン管理します）。

:::details PAT をやめて GitHub App にする、生存期間以外の理由

- 発行時に**リポジトリと権限を絞れます**（「contents: write と pull-requests: write だけ」など）。PAT は fine-grained でも人間のアカウントに紐づいた静的な権限セットで、workflow ごとに絞ることはできません。
- **個人アカウントに紐づかない**ので、退職・権限変更・アカウント停止で CI が突然壊れることがなく、監査ログ上も「誰の代理か」ではなく App の操作として残ります。
- なお、`GITHUB_TOKEN` で push したコミットは workflow を起動しないという仕様があるため、「自動生成した PR で CI を回したい」場合は結局 App トークンが要ります。

:::

:::details 鍵を持つ job を依存ツリーから隔離する — ステップ順序では閉じない

依存更新の workflow は、**install スクリプトで任意コードが走る job に、push できるトークンを持たせている**という構図をしています。詰め方は 3 段階あり、**最初の 2 つは敷居を上げるだけで閉じません**。

**1. トークンを必要としない作業を、トークン保持ステップの前に出す。** 最終的にトークンを持つステップに残るのが `git` と `gh` だけになるのが理想形です。

- 実務的な罠が 1 つ。`install` の前に `pnpm run <script>` は使えません。**`pnpm run` は実行前に依存を検証し、無ければ取りにいく**ためです（実測で `ERR_PNPM_FETCH_404`）。`node ./scripts/xxx.mts` のように直接呼び、そのスクリプトは `node:*` しか import しないようにします。

**2. しかしステップ順序では閉じません。** `$GITHUB_ENV` / `$GITHUB_PATH` は環境変数で指されたファイルで、ランナーが**後続ステップに適用**します。`install` が起動した子プロセスは環境を継承しているので、**2 ステップ先の `git` や `gh` が何を指すかを決められます。** 順序の入れ替えもインライン化も、ここには届きません。

**3. 閉じるのは job 分割です。** 新しいランナー、新しいチェックアウト、新しい環境になります。

| job          | 内容                                                                                              | 権限                        |
| :----------- | :------------------------------------------------------------------------------------------------ | :-------------------------- |
| 更新 job     | 依存ツリーのコードを動かす全部（install / 各種更新 / 生成）→ **差分をパッチとして artifact に**   | `contents: read`、鍵なし    |
| コミット job | ベースコミットを clean checkout → artifact 取得 → トークン発行 → `git apply` → commit → push → PR | App token、**install なし** |

コミット job はランナーイメージ上の `git` と `gh` しか実行せず、作業ツリーからは何も読みません。**渡るのはパッチだけで、適用されるだけで実行されません。** diff は `.git/hooks` エントリも `$GITHUB_PATH` 行も表現できず、`git apply` はワークツリー外のパスを拒否します。改竄されたパッチが運べる最悪のものは**内容**で、それは PR に着地し、CODEOWNERS の後ろで止まります。

**代替にならないもの:**

- **CODEOWNERS は代替になりません。** ランナー上の書き換えはマージではないので、コミットも PR も diff も生じません。
- **install script のアロウリストも代替になりません。** あれは依存の _install ライフサイクルスクリプト_ のアロウリストであって、ツールチェーンが読み込む全パッケージの **import 時コード**には何も言っていません。

全部の workflow を分割する必要はありません。**権限が最も強いものから**掛けます。目安は「そのトークンで `.github/workflows/` を書き換えられるか」です。

:::

:::details CODEOWNERS を「レビュー依頼の宛先」から「マージのゲート」に変える

自動化された供給チェーン攻撃には、たいてい**細工した workflow ファイルがデフォルトブランチに届く**という 1 ステップが入ります。`required_approving_review_count: 0` で auto-merge を使っていると、そこが無審査です。

`require_code_owner_review` がこれを塞ぎます。理由は単純で、**auto-merge する bot / App は code owner ではない**からです。

ただし **`* @owner` のままルールを立てると全 PR が承認待ち**になり、依存更新の auto-merge が成立しません。所有の意味が変わったので、範囲も絞り直します。基準は「**無審査で入ったら困るか**」ひとつ。

| パス                             | 理由                                   |
| :------------------------------- | :------------------------------------- |
| `/.github/workflows/`            | 本命                                   |
| `/.github/CODEOWNERS`            | ゲート自体を同じ経路で外されないように |
| リポジトリ設定の宣言ディレクトリ | 次に適用した瞬間に効く宣言             |

**あえて入れないもの:** 依存更新が毎回書き換えるファイル（バージョンカタログ、各パッケージの `package.json` など）。「無審査で入ると困る」は真ですが、**毎日トリップするゲートは毎日迂回されます。** そちらは別の手立て（成果物スモークテストや公開物専用の lint）で守ります。

**代償**: ゲート対象が動いた日の依存更新 PR は auto-merge されません。また owner は自分の PR を承認できないので、これらのパスを触る変更は admin の bypass でマージすることになります。買っているのは「**bypass を押すのが人間である**」という性質です。

:::

### 公開（publish）

- **npm trusted publishing（OIDC）を使い、長期の npm token を持たない。** workflow 側は `id-token: write` だけで済みます[^first-publish]。
- **公開する成果物そのものを検証する。** pack した tarball を隔離したワークスペースに install し、実際に import して動かすスモークテストを CI に置きます。ソースに対する lint や型検査では「publish すると壊れている」を捕まえられません。

[^first-publish]: 初回 publish だけは手動です。npm 上にパッケージが存在しないと trusted publishing を設定できないため。

:::details 検証環境を「宣言していない依存が解決しない」状態に保つ

- パッケージごとに**独立した project** + **hoist 無効** + **外部を拒否する resolve hook** を敷きます。
- 最後のものが一番重要です。リポジトリ内に検証用ディレクトリを置くと、何もしなければ Node がリポジトリの `node_modules` まで探しに行って、**ソースからビルドされた自作ライブラリを見つけてしまいます。** それでは「利用者環境の再現」になりません。
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

:::

[^suppress-vs-ignore]: suppress は将来的に修正されるべきである、という明確な意思表示となります。個別 ignore は「偽陽性であることが分かっている」という意図なのか、エラーを一時的に黙らせているだけなのかを区別しづらいです（偽陽性なら disable コメントを必須にする、という運用は可能でしょうが、機械的に強制しづらいです）。

[^flat-config]: ESLint v9 以降の Flat Config なら、ESM で書いた `eslint.config.mjs` にルール実装をコードとして import して使うことも容易です。ビルドも publish も要りません。Oxlint でも同様のことが実現できることを確認しました。

[^biome]: `biome lint --unsafe` などのコマンドがあったり、ルールをグループ化しているところからも、ルールを中央集権的に管理しようとする思想は感じます。GritQL プラグインという形で外部拡張の口は開いたものの、型情報を渡さない syntax レベルに留めているあたりにも、その思想は表れているように個人的には思います。

### 構造の制約

- **import 関係の制約を linter で定義する。** 循環（`import-x/no-cycle`）とレイヤ違反（`import-x/no-restricted-paths`、例:「`utils/` は `components/` を import しない」）。
- **ファイル拡張子の統一をスクリプトで検査する。**「`src/` 配下は `.mts` と `.tsx` だけ」のような制約です（`.ts` / `.mts` / `.cts`、`.yml` / `.yaml` の混在を防ぐ）。
- **package.json の依存記述の過不足を両方向から検査する。** import しているものが宣言されているか（ESLint `import-x/no-extraneous-dependencies`）と、宣言されているものが使われているか（**knip**）。前述の pin 方針を満たしているかも同様に検査できます。
- **公開物だけの追加検査を別に走らせる。** `src/` が devDependency を import していれば、それは壊れた publish です。
- **codemod を CI で流して差分チェックする。** 型を readonly 化する、`as const` を補う、`any` を `unknown` に置き換える——といった「常に成り立っていてほしい形」は、レビューで指摘するより変換して差分を見るほうが確実です[^codemod]。

[^codemod]: 筆者は [ts-codemod-lib](https://github.com/noshiro-pf/mono/tree/main/libs/ts-codemod-lib) にこの種の transformer をまとめています。ignore directive を書いた箇所以外はすべて変換が強制されるので、「readonly を付け忘れた」類の指摘がレビューから消えます。

:::details レイヤー順序を守らせるカスタムルールの作り方

`import-x/no-restricted-paths` はペア単位の禁止なので、ディレクトリが増えると宣言すべき組み合わせが増えていきます。**レイヤーを一列に並べて「上位への import を禁止する」**ルールを自作したほうが、宣言も維持も簡単です。

- オプションに**基礎的なものから順にディレクトリを並べます**（例: `src/utils` < `src/store` < `src/hooks` < `src/components`）。
- 各ファイルは「マッチするパス prefix が最も長い」レイヤーに分類します。ファイルが属するレイヤーより**上位のレイヤーを import していたら違反**。同一レイヤー内は許容、どのレイヤーにも属さないものは対象外です。
- エントリーポイントのように全レイヤーを束ねる必要があるファイルは、除外リストを設けて逃がします。
- 実装は `ImportDeclaration` / `ExportNamedDeclaration` / `ExportAllDeclaration` を見るだけで、数百行で済みます。**AI に書かせれば半日仕事**で、「AI がレイヤーを無視した import を書く」という頻出の問題が構造的に消えます。

:::

:::details 公開物専用の検査をどう書くか

通常の lint とは**別の実行**（専用の設定ファイル）として走らせます。同じ `import-x/no-extraneous-dependencies` を、対象を `<pkg>/src/**` に絞ったうえで `devDependencies: false` / `peerDependencies: true` で使うだけです。通常の pass はテストやスクリプトも見るので、そこで devDependency を禁止するわけにはいきません。

**黙って素通りする条件**が 3 つあるので、そこだけ注意します。

- **`packageDir` はパッケージ 1 つだけ**を指定した設定オブジェクトを、パッケージごとに生成します。まとめて渡すと「どこかのパッケージが宣言していれば全パッケージで通る」になります。
- **型定義しか無いパッケージは既定の resolver で解決できず、黙ってスキップされます。** TypeScript resolver を明示する必要があります。型だけの import も見るなら `includeTypes` も要ります。
- **インラインの `eslint-disable` を無効化**しておきます（`linterOptions.noInlineConfig`）。この検査は緩められては意味がありません。

ついでに **lint 設定ファイル自身**もこの pass で見ておくと良いです。共有 ESLint 設定は自分自身を ignore することが多く、**設定ファイルの import だけ誰も検査していない**状態になりがちです。筆者のリポジトリでは、この検査を入れた時点で既に 2 パッケージが「利用者環境では壊れる」状態で publish されていました。

:::

### 「生成 → 差分チェック」を型として使う

生成物と生成元がずれるのを防ぐ、最も効く形です。**CI で生成コマンドを実行し、`git diff` が出たら落とす。** 対象になるのは、例えば以下のようなものです。

- formatter の出力
- 自動生成される index / barrel ファイル
- README へのサンプルコード埋め込み、API ドキュメント
- 依存グラフなどの派生ドキュメント
- codemod
- リポジトリ設定のバックアップ（後述）
- 外部バージョンを pin しているファイル

その他、markdownlint と cspell でドキュメントのフォーマット・スペルも見ます。

:::message
このパターンを増やすほど、AI に「生成物を手で書き換える」余地が無くなります。生成物を直接編集する変更は必ず CI で落ちるので、生成元を直すしかなくなる、というのが効き目の本体です。
:::

:::details 派生形 — 単一の情報源から導出し、一致をチェックする

「生成物」がファイルでなくても同じことができます。例えば Node.js のサポートバージョンを 1 つの JSON にまとめ、`engines.node`・`volta.node`・CI の互換性マトリクスをそこから導出して、一致するかを検査します。

この例で効くのは、**`engines.node`（利用者への約束）・テスト対象の LTS・開発環境のバージョンが全部別物**だという点です。これを混同した変更——「EOL だからサポート下限を上げる」、下限を上げるのは破壊的変更です——は AI がやりがちなので、値の同期そのものより、**3 つが別物であることをチェックで固定する**ことに意味があります。

:::

:::details 生成スクリプト側の注意 — 既に正しいファイルを書き換えない

内容を比較してから書き、書くときは一時ファイルへの書き込み + `rename` で原子的に置き換えます。

筆者は barrel 生成器が毎回全ファイルを書き直していたせいで、**並列ビルド中に別パッケージがそのファイルを import して落ちる**という事故を起こしました（`SyntaxError: ... does not provide an export named ...`）。生成が速いほど気づきにくい類の競合です。

:::

### リポジトリ設定のコード化

- **branch protection / ruleset / Actions settings / Pages などを gh CLI（GitHub API）で dump し、JSON でコミットする。**
- **「宣言（望ましい状態）」と「現状のミラー」を分けて持ち、CI で現状をミラーと突き合わせる。** GUI での不審な設定変更が差分として出ます。
- **守備範囲を「ruleset とマージ設定」で終わらせない。** environments や Dependabot alerts は、管理下に入れるまで**無効であることが誰にも見えません**。
- **ドリフト検査の鍵は、依存を自動更新するリポジトリに置かない。** 検査に必要なトークンは弱くできないので、**置き場所のほうを変えます**（後述）。

:::details `gh` + `jq` だけで書く場合

専用ツールを用意しなくても、workflow の中に直接書けます。

```yaml
- name: Dump the live settings
  env:
    # GITHUB_TOKEN ではなく GitHub App のトークン。理由は後述。
    GH_TOKEN: ${{ steps.app-token.outputs.token }}
    REPO: ${{ github.repository }}
  run: |
    set -euo pipefail
    mkdir -p settings/{repository,rulesets,actions}/bk

    # 1. リポジトリ設定。pushed_at や *_count のような揮発するフィールドを
    #    含めると毎回差分が出るので、見たいキーだけを jq で抜く。
    #    -S でキー順も固定する（API の返す順は保証されない）。
    gh api "repos/${REPO}" | jq -S '{
      allow_squash_merge, allow_rebase_merge, allow_merge_commit,
      allow_auto_merge, delete_branch_on_merge, allow_update_branch,
      squash_merge_commit_title, squash_merge_commit_message,
      web_commit_signoff_required, security_and_analysis
    }' > settings/repository/bk/settings.json

    # 2. ruleset。一覧 API は rules を返さないので、id で 1 件ずつ引き直す。
    gh api "repos/${REPO}/rulesets" --jq '.[].id' | while read -r id; do
      gh api "repos/${REPO}/rulesets/${id}" > /tmp/ruleset.json
      name="$(jq -r .name /tmp/ruleset.json)"
      jq -S '{id, name, target, enforcement, bypass_actors, conditions, rules}' \
        /tmp/ruleset.json > "settings/rulesets/bk/${name}.json"
    done

    # 3. Actions 設定。SHA ピン強制と fork PR の承認ポリシーは別エンドポイント。
    gh api "repos/${REPO}/actions/permissions" > /tmp/perm.json
    gh api "repos/${REPO}/actions/permissions/fork-pr-contributor-approval" > /tmp/fork.json
    jq -s -S '.[0] * .[1]' /tmp/perm.json /tmp/fork.json \
      > settings/actions/bk/settings.json

- name: Fail if the live settings drifted
  run: |
    if [ -n "$(git status --porcelain -- settings/)" ]; then
      git --no-pager diff -- settings/
      echo '::error::Repository settings drifted from the committed backup.'
      exit 1
    fi
```

運用して分かった落とし穴が 3 つあります。

- **`GITHUB_TOKEN` では読めません。** workflow の `permissions:` に `administration` というスコープは存在せず、リポジトリ設定と ruleset はそこに属します。GitHub App のインストールトークンが必要です。
- **しかも `administration: read` では足りません。** read だと merge 関連の設定と ruleset の `bypass_actors` が API から返らず、「空の差分」ではなく「キーが消えた差分」が出ます。
- **PR では走らせてはいけません。** 比較対象は「リポジトリの現在の設定」であって、ブランチが変更できるものではないので、PR 上で走らせても答えは変わりません。むしろ誰かが Web UI で設定を 1 つ変えると、**関係のない open PR が全部赤くなり、しかもその PR の作者には直しようがありません。**
  - このとき **`pull_request` トリガー自体は残します。** 必須チェックである以上、head コミットに現れないコンテキストは永久にマージをブロックするからです。job ではなく**ステップを止める**と、集約 job は `success` のままで除外条件も要りません。
  - セキュリティ上の意味のほうが大きい変更です。**強い権限のトークンが PR ブランチでは発行されなくなります。** 従来は設定ディレクトリを 1 バイト触った PR が、直前に依存の install スクリプトを走らせたブランチで ruleset を書き換えられるトークンを持っていました。

:::

:::details 弱くできない鍵は、置き場所を変える

上の落とし穴 2 つ目が効いてきます。**ドリフト検査のトークンは弱くできません。** 読み取りのために 2 つの write が要ります。

| 欲しいもの                 | 必要な権限              | 根拠                                                                                     |
| :------------------------- | :---------------------- | :--------------------------------------------------------------------------------------- |
| ruleset の `bypass_actors` | `administration: write` | "Get a repository ruleset": `bypass_actors` は ruleset への write 権限がある場合のみ返る |
| merge 関連設定             | `contents: write`       | "Get a repository": merge 関連設定を見るには `contents:read` と `contents:write` が必要  |

どちらも落とせません。`bypass_actors` は ruleset の抜け道そのもので、**ドリフト検知で最も捕まえたい変化**です。

弱くできない鍵に残る手は、**置き場所を変えること**でした。

> 依存更新を無人でマージするリポジトリは、ruleset を書き換えられる鍵の置き場所として不適切で、**ここに無い secret には、ここでの run は届かない。**

検査ごと別リポジトリへ移し、日次で回します。App の installation は対象リポジトリを含む必要が残りますが、**installation は侵害された依存が到達できる部分ではありません**。到達できたのは secrets のほうです。

**移すときの順序に罠があります。** 「必須チェックから外す」→「設定を反映」→「workflow を削除」の順で、**3 つの PR に分ける必要があります。**

`pull_request` の workflow 定義は merge ref から読まれるので、**PR の中で削除された workflow は、その PR 自身では動きません。** 必須チェックのまま workflow を消すと、コンテキストが永久に報告されず、ruleset は要求し続け、**開いている全 PR が "Expected — waiting for status to be reported" で止まります。** clear する手段はありません。

:::

:::details environment は、存在しないまま参照すると保護ルール無しで自動生成される

知らないと気づけない挙動です。**workflow が参照した environment が存在しないと、GitHub は保護ルール無しでそれを作ります。** 筆者のリポジトリでは、リリース用 environment がまさにそうなっていました。作成時刻は、あるマージの 3 秒後——リリース workflow の run が始まったのと同じ秒です。

「environment を指定してあるから deployment branch policy で守られている」と読める状態で、実際には何も制限していませんでした。**environment は「宣言したつもり」が最も起きやすい設定**なので、設定のコード化に含める価値が高い部類です。

含めるときの注意:

- GitHub が**別エンドポイントに置いている branch / tag の pattern** まで 1 ファイルに含めます。分けて持つと「制限しているように読めて何も制限していないファイル」が書けてしまいます。
- 適用前に「選択が `custom_branch_policies` でないのに pattern が書いてある」「`protected_branches` と `custom_branch_policies` が両方 true」を弾きます。
- pattern は置き換えではなく**差分反映**にします。消して作り直すと id が変わり、その間だけ deploy できない窓ができるためです。

**Dependabot alerts も同じく見えにくい設定です。** こちらは API が JSON body を持たず、**現在値がステータスコードで返ります**（有効 204 / 無効 404）。404 を `enabled: false` に変換し、それ以外は投げ直すようにしないと、「無効」と「読めなかった」が潰れます。なお `dependabot_security_updates`（修正 PR を作るか）とは**別の設定**です。

:::

### 必須チェックは「集約 job 1 つ」にする

- **required status check には matrix の各エントリではなく、`needs:` で matrix を待って結果を判定するだけの集約 job 1 つを登録する。**
- 主な理由は **ruleset の整備コスト**です。required status check は**チェック名の文字列一致**なので、matrix エントリを直接登録していると**チェックを 1 つ追加するたびに ruleset 側にも名前を足す 2 箇所の編集**が要ります。集約 job 方式なら、コマンドを追加した瞬間からマージをブロックする条件として機能します。
- **集約 job は `if: always()` にする。** そうしないと matrix と一緒にスキップされ、報告自体が消えます。

:::details 2 箇所編集を忘れると何が起きるか / 副次的に塞がる穴

**忘れると「実行され、報告され、しかし何もブロックしない」チェックができます。** 筆者のリポジトリでは 4 つそうなっていて、そのうち 3 つは「生成 → 差分チェック」型、つまり**生成物が生成元とずれたまま入るのを防ぐはずのチェック**でした。

**副次的に穴も 1 つ塞がります。** matrix エントリを直接 required にしていると、job ごとスキップされたときに**古い success が残ったまま**になります（skip された job は matrix を展開しないので、名前が上書きされない）。実測では、green だった PR に skip 用のラベルを付けた後も 22 個の matrix チェックが success のままでした。集約 job は matrix を持たないので名前が安定し、必ず最新の run で上書きされます。

:::

### CI 実行時間

チェックを増やすほど CI 時間が問題になるので、削る仕組みを最初から入れておきます。

- **差分ゲート。** 変更パスがそのチェックの読む範囲に無ければスキップします。**step 単位ではなく job 単位**にするのが要点で、そうしないと matrix の全 runner が「やることが無い」と判断するためだけに起動します。
- **`concurrency` + `cancel-in-progress`** で、連続 push の古い run を捨てる。
- **デフォルトブランチへの push では原則何も走らせない。** squash merge の tree は PR の head と同一で、既に検査済みだからです。
- **out-of-date なブランチでもスキップする。** `strict_required_status_checks_policy` を掛けている以上そのままではマージできず、rebase すれば `synchronize` で全部走り直すので、その前の run の結果は誰も使えません。
- **「まだ CI を回さなくていい PR」の判定に draft を使わない。** ラベル（または PR title）で判定すべきです。
- **merge queue が使えない環境では、ローカルスクリプトで代用できる。**

:::details draft を判定軸にしない理由と、マージを止める仕組み

**draft / open は GitHub の公式機能として CODEOWNERS へのレビュー依頼が飛ぶかどうかと紐づいています。** これを「CI を実行するか否か」の軸に流用すると、**「CI は回したいが CODEOWNERS へのレビュー依頼はまだ飛ばしたくない」**という状況に対応できません。

ラベルで判定すれば、ラベルはイベントのペイロードに乗るので API 問い合わせが要らず、job レベルの `if` で判定できるため runner が 1 台も起動しません。

- **トリガーに `labeled` と `unlabeled` の両方を入れる**のを忘れずに。`unlabeled` が無いと、ラベルを外しても push 済みコミットに対してチェックが走り直しません。逆に言えば、**ラベルを外すことが「CI を回してくれ」の合図**になり、空コミットを積む必要がなくなります。
- **スキップとマージブロックは別物です。** skipped は required status check を満たしてしまうので、ラベルが付いている間マージを止める仕組みが別に要ります。**`pending` の commit status** を head コミットに書くのが素直です。
- job の失敗ではなく status の `pending` にするのが要点です。job は success / failure / skipped / cancelled しか返せず、前二つはマージを止められないか、あるいは「まだ準備できていない PR」を「壊れている」と表現することになります。実際 failure でやっていた時期は、PR 一覧に赤 × が出て、push とラベル操作のたびに失敗メールが飛びました。`pending` なら意味が正確で、マージも同様に止まり、通知は飛びません。

:::

:::details merge queue の代替スクリプト

個人アカウントの無料プランでは merge queue が使えませんが、ローカルで走らせるスクリプトで代用できます。

- 「auto-merge 有効 & skip ラベル無し」の PR を列挙し、**out-of-date のものを 1 つずつ** rebase して push → CI が通れば auto-merge に任せる、を繰り返すだけです。マージ自体はスクリプトではなく GitHub の auto-merge が行います。
- 前述の「out-of-date ブランチでは CI をスキップ」と組み合わせると、**同時に CI が走るのは常に 1 本**になります。3 本並行で rebase すると、1 本がマージされた瞬間に残り 2 本が out-of-date になり、その分の CI 実行が丸ごと無駄になります。
- rebase は使い捨ての `git worktree` で行うので、作業中のチェックアウトを汚しません。

:::

### まだやっていないこと

- CodeQL、`dependency-review-action`、OSV スキャンは未導入です。Dependabot alerts は有効化しました。
- `dependabot_security_updates`（修正 PR の自動作成）は**意図的にオフ**のままです。lockfile は自前の更新 workflow が所有しており、Dependabot の PR は衝突するだけなので。

## monorepo vs 個別 repo

社内 private repository の多くは monorepo にまとめた方が開発効率が向上する、と筆者は考えています。社内 monorepo は巨大なごった煮で良く、Google も Meta も意味的まとまりで分けてはいません。

### monorepo のメリット

- **ユーティリティ等の共通化切り出しが容易**で、かつ**共通ライブラリの利用アプリケーション側がそのままテストとして即日機能する**（publish 後に install して初めてバグに気づく、を防ぎやすい）。
- **開発環境ツール（type checker, linter, formatter, …）の設定を共通化しやすい。** pnpm `catalog:` で devDependencies のバージョンを統一でき、依存更新のメンテナンスコストが 1 repo に集約されます。eslint config や tsconfig も共通化でき、legacy config が放置されにくくなります。
- **GitHub Actions workflow の共通化が容易。** ただし CI 実行時間が長くなるので、差分ゲート・skip ラベル・concurrency など「無駄な実行を省く整備」が前提になります（前述）。
- **`CLAUDE.md` 等の AI 向け規約ドキュメントを整備しやすい。**「1 リポジトリ、1 規約ファイル」が一番確実です[^agent-config]。
- **個々のリポジトリに適用するとコストが掛かって渋ってしまうような開発環境改善を、1 回の投資で全体に適用できる。** チェックやコード自動生成の強化は AI coding のために積極的に行うべきで、ここが一番効きます。
- **サプライチェーン対策の設定**（隔離期間、install script のアロウリスト、Actions の SHA 固定、更新 workflow）も 1 箇所で済む。

[^agent-config]: 筆者は以前、共有リポジトリから規約を vendoring して各リポジトリに配る生成器を持っていましたが、同期が追いつかず実際に差分が発生していました。統合後は生成器ごと捨てて 1 ファイルにしています。チェックを増やすたびに「なぜそうしているか」を同じファイルに書き足していけるのも大きく、AI が善意で設定を"直して"しまうのを防げます。

### 個別 repo でしか実現できないこと

- **リポジトリ単位でしか存在しない GitHub 機能。** テンプレートフラグ、star / watch / fork の粒度、リポジトリ単位の Discussions と topic 検索。
- **権限の分離。**
- **譲渡・アーカイブ・削除の単位。**
- **外部コントリビュータの参入障壁**（public repo のみ該当）。

一言でまとめると、**個別 repo の利点は主に社会的・制度的なもの、monorepo の利点は開発ループの最適化**です。移行コストは小さくないので、どちらを取るかは組織ごとの判断になります。

## 導入順序（低コスト順）

1. 隔離期間（`minimumReleaseAge`）と install script のアロウリスト、Actions の SHA 固定 — 設定を数行書くだけ。
2. 依存更新の自動化 workflow — 1 で固定した pin を動かし続けるために必須。
3. formatter / linter の「生成 → 差分チェック」化 — 既存違反は bulk-suppressions で先送りできる。
4. リポジトリ設定の dump とドリフト検知。
5. 依存宣言の過不足チェック（`no-extraneous-dependencies` / knip）。
6. strict な標準ライブラリ型定義と codemod — package 単位で段階的に。
7. PAT の廃止と GitHub App 化、鍵を持つ job の分離、publish の trusted publishing 化、成果物スモークテスト。
8. プロジェクト固有のカスタム lint ルール — ここまで来ると、AI に「このリポジトリでやってはいけないこと」を都度説明する必要がほぼ無くなります。
