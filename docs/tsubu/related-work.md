<!-- cspell:ignore rescript Takikawa Rastogi Swamy Fournet Bierman Vekris Cosman Jhala Racket KaRaMeL miTLS EverParse EverCrypt POPL PLDI RTTI bivariance nominality HACL Rondon Kawaguchi Tanter Vazou Dafny Hoare Idris Agda -->

# 先行研究・関連プロジェクトと採否

この言語の設計が参照する先行事例のカタログ。各項目に「何を採るか / 採らないか」を明記する。他ファイルで詳述済みのもの(class 代替の言語調査 → [spec/classes.md](./spec/classes.md)、TC39 proposals → [spec/future-syntax.md](./spec/future-syntax.md))はここでは繰り返さない。

## 設計の直接の先例

### asm.js

JS のサブセットであり、すべてのプログラムが JS として有効・同一セマンティクスで、専用ツール(AOT コンパイラ)だけがそれを認識して高速化した。**採用**: 「合法サブセット + 外部ツール」という v1 の基本構図そのもの(D-1)。asm.js が後継の WebAssembly に道を譲った経緯は、「サブセット言語は成功すると独自基盤への橋になる」という点でも参考になる。

### TypeScript `--erasableSyntaxOnly` / Node.js type stripping

TS 自身によるサブセット化の動き。型を消すだけで JS になる構文に限定する。**採用**: D-4 として包含済み。この言語の型レイヤーは常に消去可能。

### ReScript

OCaml 系の型システムを持つ AltJS。**反面教訓として参照**([spec/modules.md](./spec/modules.md)、[spec/future-syntax.md](./spec/future-syntax.md)): ① グローバル名前空間を共有する module syntax への不満 → 明示 import の強制、② 出力コードが eject に耐える品質でない → v2 transpiler の受け入れ条件(コメント・名前・構造の保存)を仕様として先に固定。**採用**: `let mut` のバランス感(mutation を不可能にせず、明示コストを課す)。

### Flow

Facebook の JS 型検査器。TS より健全性志向が強かった(変性の扱いなど)にもかかわらず、エコシステムのツール重力(エディタ統合・型定義の供給)で TS に敗れた。**教訓**: 型システムの品質はツールチェーンの可用性に勝てない。v1 が既存 TS ツールをそのまま使える形を最優先するのはこのため(D-1)。

## 健全性の研究系譜

### Safe TypeScript(Microsoft Research, POPL 2015)

Rastogi, Swamy, Fournet, Bierman, Vekris "Safe & Efficient Gradual Typing for TypeScript"。TS 全体を対象に、静的検査の強化 + 残余のランタイム検査(RTTI)を出力 JS へ埋め込むことで健全な gradual typing を実現した研究プロトタイプ。当時の TS 0.9.5 に "safe" モードとして統合されたが、本家にマージされず 2015 年以降更新はない。TS 本体が「健全性を目標にしない・RTTI を持たない・型がコード生成を変えない」方向へ確定したことと、sound gradual typing の境界検査コスト問題(下記)が背景。

この言語との関係は**構図の逆転**: Safe TS は「TS 全体を守る」ためにランタイム検査が必要になったが、この言語は「守れない構文を捨てる」ので、同じ不健全性の大半を静的に消せる。

| Safe TS の要素                     | この言語での扱い                                                                                                                                                                                              |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 不健全性の発生源の列挙             | **採用**: 不健全性カタログ(TODO)の雛形。bivariance → メソッド短縮記法禁止、`any`/downcast → 禁止、で大半は静的に対処済み                                                                                      |
| 共変配列書き込みの実行時チェック   | **静的に置換**: 共変性が不健全なのは書き込み経由のみで、readonly 配列の共変は健全([spec/readonly.md](./spec/readonly.md))。残るのは `mut_` 配列だけで、そこは checker で不変(invariant)扱いを強制すれば閉じる |
| `any` 境界の RTTI 検査             | **消去版で採用**: 外部由来の `any` を `unknown` 同然に扱い narrowing/検証を強制(typescript-eslint `no-unsafe-*` 系)                                                                                           |
| 「静的/動的の境界で検証する」構図  | **採用(境界限定)**: parse-don't-validate。外部データ・外部 lib の値は境界でバリデータ(ts-fortress)を通す。null 正規化・throwable 境界([spec/exceptions.md](./spec/exceptions.md))に続く「境界で潰す」第三の柱 |
| class の nominal 化(RTTI を安価に) | **消去版で採用**: brand 型が消去圏内の nominality。ネイティブ `Int`([spec/future-syntax.md](./spec/future-syntax.md) 候補 7)は「checker サポート付き nominality」= nominal types の静的版                     |
| 型主導のランタイムチェック挿入全般 | **不採用**(D-2/D-4 と衝突)。ただし v2 transpiler 前提の「dev ビルド限定で境界 assert を挿入する checked モード(本番は純粋消去)」は将来の opt-in 候補として記録                                                |

前身に TS\*(Swamy ら "Gradual Typing Embedded Securely in JavaScript", POPL 2014)がある。

### Sound gradual typing の性能問題(Takikawa et al., POPL 2016)

"Is Sound Gradual Typing Dead?" — Typed Racket での実測により、静的部分と動的部分の境界を値が跨ぐたびに検査コストを払う方式は、最悪ケースで桁違いのオーバーヘッドになることを示した。**教訓として採用**: 全域ランタイム強制を選ばない根拠。検証は境界に置き、境界の数を言語設計(null 正規化・Result 化・バリデータ)で少なく保つ。

### Refined TypeScript(Vekris, Cosman, Jhala — PLDI 2016)

TS に refinement types(述語付き型)を載せた研究(システム名 RSC)。`number` に「0 でない」「配列長未満」のような述語を付け、SMT ソルバで検証することで、0 除算や配列境界外アクセスを**静的に**排除する。この言語が branded number(`NonZeroNumber`、`Num.div` の非ゼロ要求、`Int`)で**手動近似**していることの自動版にあたる。

仕組みの要点:

- 入力 TS を SSA 中間形へ変換してフロー依存の検査を可能にし、述語付き型から検証条件を生成して SMT で判定する。述語の**推論**は Liquid Types 枠組み(下記)により自動化され、注釈負担を下げている。注釈はコメント内 DSL(`/*@ ... */`)。
- TS の narrowing(`typeof` タグ検査)を述語として一般化して扱う — TS が組み込みで持つ narrowing は refinement の特殊ケース、という整理を与えた。
- **主題の一つが mutability との相互作用**: 可変フィールドに付けた述語は代入で無効化されるため、RSC は型に immutability 修飾子を持ち、強い保証は immutable な部分にしか与えない。**この言語の readonly-by-default([spec/readonly.md](./spec/readonly.md))は、refinement 検査の前提条件を先に整えていることになる** — v3 で述語検証を載せる際の地ならしが仕様の時点で済んでいる、という接続。
- 研究プロトタイプで開発は停止。**参照**: v3(独自型検査器)で数値制約を扱うときの第一参考文献。brand 型は「述語の成立を名前で覚える」だけで検証しないが、refinement types は述語自体を型に載せて検証する — 候補 7 の「理想形」の具体像。brand の literal 相性問題(microsoft/TypeScript#53923)も、refinement なら `1 : {v | v = 1}` の包含として自然に解ける。

### Refinement types の系譜と最近の実装

- **Liquid Types(Rondon, Kawaguchi, Jhala — PLDI 2008)** — 系譜の起源。述語を決定可能な論理(線形算術等)に制限して SMT で自動判定し、述語抽象 + 不動点計算で refinement を**推論**する。「full 依存型より弱いが、証明をほぼ自動化できる」スイートスポットを定義した。
- **LiquidHaskell** — 系譜の実用最先端で、**現在も活発に開発されている** GHC プラグイン。refinement reflection により定理証明まで到達。実プロジェクトでの利用実績がある。
- **Flux: Liquid Types for Rust(Lehmann, Geller, Vazou, Jhala — PLDI 2023)** — 最近の最重要動向。**Rust の所有権・借用が「mutation が述語を壊す」問題を言語側で解決している**ため、RSC が mutability 修飾子で苦労した部分が ownership で消える。refinement の宿主には mutation 規律のある言語が向く、という実証であり、readonly-by-default を先に固めるこの言語のロードマップを裏付ける。活発に開発中。
- **Gradual Refinement Types(Lehmann, Tanter — POPL 2017)** — gradual typing と refinement の統合理論。「述語を段階的に導入する」ことの型理論的な基礎で、v1(brand による手動近似)→ v3(述語検証)という本言語の移行モデルの理論的裏付けにあたる。
- 分野の成熟を示す近年の動き: PLDI 2025 に Liquid Types の**ユーザビリティ障壁**の研究、2026 年の arXiv に範囲述語に絞った実用化(Practical Range Refinement Types with Inference)— 範囲型は `Int32` / 数値分類([spec/future-syntax.md](./spec/future-syntax.md) 候補 7)と直結する。
- **ライブラリレベルの近似(SMT なし)**: Scala 3 の **Iron**(前身 refined、Haskell refined も同系)は `Int :| Positive` の形の述語付き型を、**リテラルはコンパイル時にマクロが述語を評価**して受理し、動的値は実行時 refine で導入する。**SMT を持たずに branded literal 問題を解く現実的な中間解**であり、v3 の `Int` 設計の第一歩は「checker がリテラル定数に対して述語(`Number.isInteger` 等)を評価して subtype 判定する」だけで到達できることを示す。フル SMT はその後の段階でよい。
- TS 圏の現在地: zod `.brand()` / Effect Schema / ts-fortress = **実行時バリデーション + brand**。これは「境界での refinement 導入」に相当し、静的側には brand 名しか残らない。v3 は静的側に述語を残す拡張、と位置づけられる。
- 隣接分野: F\*(上記 — refinement を含む依存型 + effect)、Dafny / SPARK(Floyd-Hoare 契約 + SMT の検証器)、Idris / Agda(完全依存型、証明は手動)。自動化の度合いと表現力のトレードオフの中で、Liquid 系は「自動」に最も寄った点にいる。

### F\* と Project Everest(参考 — 系譜の行き先)

Safe TS の著者ら(Swamy, Fournet)がその後注力した先。F\* は依存型 + effect system + SMT(Z3)自動証明を持つ証明指向関数型言語で、検証済みプログラムを OCaml/F#/C(KaRaMeL 経由)へ抽出する。Project Everest はそれを使って HTTPS スタック全体を検証するプロジェクト(検証済み TLS の miTLS、検証済み暗号ライブラリ HACL\*、パーサ検証の EverParse 等。HACL\* のコードは Firefox や Python の標準ライブラリに採用実績がある)。**この言語への直接の採用要素はない**が、「gradual typing で既存言語を守る」路線から「証明可能な言語で書き、実用言語へ抽出する」路線への転回そのものが、v1(既存 TS を絞る)→ v2/v3(独自の層を厚くする)というこの言語のロードマップの遠い相似形にあたる。

## 標準ライブラリ・パターンの先例

- **neverthrow / fp-ts** — Result/Optional のギャップ分析の比較対象([spec/stdlib.md](./spec/stdlib.md))。`safeTry`(generator による `?` 相当)は neverthrow 方式を採用済み([#1702](https://github.com/noshiro-pf/mono/pull/1702))。
- **ts-pattern** — パターンマッチの関数ライブラリとしての先行例。v2 構文([spec/future-syntax.md](./spec/future-syntax.md) 候補 2)の設計時に、TS 型システム内でどこまで網羅性検査が可能かの実証として参照。
- **Rust / OCaml / ReScript / Haskell / Elm の class 代替機構** — [spec/classes.md](./spec/classes.md) に詳述。
