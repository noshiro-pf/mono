AI coding 促進とサプライチェーン攻撃対策のための開発環境整備の方針を示す markdown ドキュメントを作ろうとしています。
draft を下に示すので、 /workspace/noshiro-pf/mono で行っている施策を確認して補完しつつまとめてください。
冗長にならないよう、箇条書きで短く簡潔にまとめてください。

---

# 開発環境整備方針（TypeScript リポジトリ想定）

## サプライチェーン攻撃の対策

- pnpm × minimumReleaseAge
    - ゼロデイ対策 7 days
    - 社内パッケージなど許容したいものは minimumReleaseAgeExclude に書けば通せる。
    - リリース直後の外部パッケージ `foo@1.2.3` を安全性を確かめた上で追加するときは、**固定バージョン指定**で minimumReleaseAgeExclude に `foo@1.2.3` を書く。
      `minimumReleaseAgeExclude: true` にしておけば、 foo@1.2.4 以降がリリースされ install されたタイミングで lockfile から消え、 minimumReleaseAgeExclude エントリが自動削除される。
- 依存の pin 留め
    - dependencies は patch のみ許容 or 完全固定
        - 完全固定だと、推移的依存により同ライブラリの複数のバージョンが同一アプリケーションにインストールされることによる不都合が生じる可能性もある。 patch version 差分くらいは許容した方が良いかもしれない。
    - devDependencies は完全固定（ `^` 無し）
        - dependabot や自前 pnpm update workflow によりその pin を毎日更新で済む
- github actions の `uses` のバージョンも hash 値固定
    ```yml
    steps:
        - name: Checkout
          uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
    ```
    - こう書いても dependabot が更新してコメントの `# v7.0.1` の部分もよしなに更新してくれる。
    - pnpm update に github actions のバージョンを更新するオプションも v11.16.0 から追加された。

## AI coding

- 静的検証の強化
    - Linter ルールの強化（ESLint, Oxlint）
        - ESLint ならガチガチに強化したルール設定でも bulk-suppressions という機能により即時有効化できる（個別 eslint-disable ディレクティヴの追加は不要）。
    - strict-ts-lib 導入
        - TypeScript 公式の標準ライブラリでは `JSON.parse` 結果が `any`、 型注釈無しで生成した `new Map()`の型が `Map<any, any>` になるなど危険
    - ファイルの配置
        - 「utils/ は components/ から import していない」などの import 関係の制約を linter でチェック
    - ファイル拡張子の統一（ .ts/.mts/.cts/.js/.mjs/.cts, .yml/.yaml, ...）
        - 「src 配下には .ts か .tsx しか存在しない」をスクリプトでチェック
    - package.json の依存の記述の過不足チェック
        - import しているものを (dev)dependencies で宣言しているか -> ESLint import-x/no-extraneous-dependencies
        - (dev)dependencies に書かれているものは使われているのか -> knip
    - 依存の記述が前述の通り「完全固定」「patch 差分のみ許可」などの制約を満たしているかもチェック
    - ts-codemod-lib の `convert-to-readonly` や `append-as-const` transformer を実行 ＆ CI で実行して差分チェックする
        - ignore directive を書いた箇所以外すべてで readonly 化が強制され実装の堅牢性が向上する。
- styling check
    - prettier, oxfmt 等の実行 -> git diff check を Github Actions で走らせ差分が出たら落とす。
    - markdownlint, cspell でテキストドキュメントのフォーマットやスペルのチェック
- リポジトリ設定を dump
    - branch protection rules などの設定を gh CLI で取得し、 json ファイルを repo-settings/ に配置するスクリプトを作製する。
      -> バージョン管理
    - Github Actions workflow でこのスクリプトを実行 -> 変なルール変更が入っていたら差分で気づける

AI がミスしたり好ましくない実装をする可能性を極力排除し、レビューコストをなるべく下げるには、静的検証により徹底的に縛るべき。

## mono repo vs 個別 repo

社内 private repository の多くは mono repo にまとめた方が開発効率が向上すると筆者は考えている。
社内モノレポは巨大なごった煮で良く、Google も Meta も意味的まとまりで分けてはいない。

### mono repo のメリット

- ユーティリティ等の共通化切り出しが容易、かつ共通ライブラリの使用アプリケーション側がそのままテストとして即日機能する（publish 後使用側に install して初めてバグに気づく、を防ぎやすい）。
- 開発環境ツール（type checker, linter, formatter, etc.）設定を共通化しやすい
    - pnpm catalog 機能を使い、各 workspace の devDependencies バージョンを統一するのが便利。依存パッケージ更新のメンテナンスコストが 1 repo に集約される。
    - eslint config や tsconfig も共通化できる。 legacy config が放置されにくくなる。
- Github Actions workflow 共通化が容易
    - （注）CI実行時間が長い場合には、差分が発生したところだけチェックするようにしたり、 "WIP" label を付けている間はスキップするなど、無駄な実行を省くための整備が必要になる。
- CLAUDE.md 等の共通規約ドキュメントの整備がしやすい。
- 個々のリポジトリに適用するとなるとコストが掛かるため渋ってしまうような開発環境改善を適用しやすくなる。
    - チェックやコード自動生成などの強化は AI coding のために積極的に行うべき。

### 個別 repo でしか実現できないこと

- リポジトリ単位でしか存在しない GitHub 機能
    - テンプレートフラグ、star / watch / fork の粒度
    - リポジトリ単位の Discussions と topic 検索
- 権限の分離
- 譲渡・アーカイブ・削除の単位
- 外部コントリビュータの参入障壁（public repo のみ該当）

一言でまとめると、個別 repo の利点は主に社会的・制度的なもの。 monorepo の利点は開発ループ最適化。

monorepo 化は移行コストも伴うので一旦 future work です。

---

## phase 2

以下の内容を書き足したいです。

- L53
    - Dependabot にしたのは、依存ごとに PR が作られ、 merge 待ちが大量に発生することで運用コストが高くなっていたためです。 1 PR にまとめ、 pnpm self-update なども一括で行うことでかなり運用コストを下げることができました。
    - actions の更新は pnpm 11.16.0 で実装されたまだ新しい機能であり、 minimumReleaseAge が効かないという問題が現状あります。 issue にもなっています（関連 Github issue を探してリンクをここに書く）。筆者は現状 major version upgrade だけ拒否する設定にして workflow 実行が壊れないようにだけしています。 dependabot には `package-ecosystem: 'github-actions'` 側にも `cooldown` 設定があるので、 Github Actions のみ dependabot で更新する、は現状アリだと思います（いずれ pnpm 一本に統一できると思われる）。
- L58
    - ［依頼］dependabot では cooldown を設定できる理由を調査してください。
- L62
    - そもそもセキュリティリスク軽減のため、 PAT を一切使わず Github Apps で短命トークンを生成するようにしている、という旨を書いてください。 PAT を使っていると、ログなどに出力されて漏洩し悪用されてしまうリスクがありますが、 Github Apps なら短命トークンを生成し使用できるため遥かに安全です（それ以外に書くべき理由があれば補足してください）。
- L88
    - ESLint より高速に動作する後発 linter も色々出ていますが、筆者が現状 ESLint を使い続けている決定的な理由が二つあります。
        - ESLint の bulk-suppressions （リンク化）に相当する機能を持つ他の Linter が存在しないこと（2026年9月調査時点）。業務のコードなど、静的検証を強化したいが急激なコードの書き換えが難しい場合に、新規コードには強力な制限を適用したい、というユースケースはこれ以外では叶えるのが難しいです。
        - カスタムルール実装ができること。AI を使えばカスタム lint ルールを実装することは容易であり、これにより AI が書くコードを縛ることは経験上非常に有効です。 Oxlint の JS Plugin や ESLint などいくつかの既存 linter でカスタムルール実装が可能ですが、 biome は思想上カスタムルール実装をおそらくサポートしていないため、この時点で筆者は biome を採用する可能性がゼロになりました（AI coding 時代にカスタム lint ルール実装ができないデメリットは吞むことができない）。
            - ESLint v9 以降の Flat config なら ESM 形式で書いた eslint.config.mjs に lint ルール実装をコードとして import して使うのが容易です。
- L91: strict-ts-lib の npm page への URL を貼ってください。
- L96: 型レベルテスト ... `expectType` はts-data-forge で提供しているユーティリティであることを書かないと、この部分の記述は意味が分からなさそうです。
- L100:
    - 業務では `import-layer-order` というカスタムルールを作り、 src 直下のディレクトリ間の依存方向が DAG になっていることを保証するようにもしました（ /workspace/tier4/AutowareEvaluationDashboard/configs/eslint/plugins/import-layer-order.mts の内容から必要な説明を補足してください。業務リポジトリなので余計な情報は出さないように。）。 OSS 化してまとめても良さそうですが未実施です。
        - L155 の内容にも対応するため L155 は削除で良さそう？
- L105:
    - 「**公開物専用の追加検査**: `src/` が devDependency を import していないか。」 -> どこでどのように検査しているか説明が抜けています。
- L139:
    - 「main への」が必要そう。
- L141:
    - 「必須チェックは集約 job 1 つにする」これはどちらかというと ruleset の整備コスト低減のための施策です。チェック対象のコマンド等を追加しても集約 job の成否でチェックしていれば repo-settings/ に差分は出ず、尚且つマージをブロックする条件として即日機能します。
- L148:
    - draft or open は 「CODEOWNER へのレビュー依頼が飛ぶかどうか」、と（Github の公式機能で）紐づいています。そのため、これを「CI を実行するか否か」の軸にすると CI 実行はしたいが CODEOWNERS へのレビューはまだ飛ばしたくない、という状況に対応できません。ラベルや PR title で判定すべきです。

### その他のコメント

- CLAUDE.md にも開発方針や開発環境整備についての経緯が残っている可能性があるので、それを読んで補足できることがあったらしてください。
- 個人の無料契約だと merge queue 機能が使えないため、ローカルで実行できるスクリプトにより「Auto-merge=enabled & WIP label 無し」なPRを一つずつ rebase して CI が通ったらマージしていくことができるようにしました。これにより、「out-of-date branch では CI 実行をスキップ」する設定と併せて無駄な CI 実行を抑制しています。

## phase >=3

minimumReleaseAgeExcludePrune: true という設定を追加しておくと
minimumReleaseAgeExclude を固定バージョンで pin
していればそのバージョン以降がインストールされたタイミングで exclude
から自動削除されるので便利、ということも補足しておきたいです。
