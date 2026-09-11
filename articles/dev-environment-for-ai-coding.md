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
