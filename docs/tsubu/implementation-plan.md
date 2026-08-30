<!-- cspell:ignore tsslint tsgo -->

# v1 実装計画

v1 チェッカー開発の段階計画。ゴールは「1 回の検査で Tsubaのチェックを高速に走らせる単一ツール」だが、そこへ直行せず、仕様の検証を安い手段で先に済ませ、資産(適合性コーパス)をエンジン非依存に積む。

## 前提となる 2 つの事実

1. **冗長さの本体は AST 走査の二重ではなく Program(型情報)構築の二重。** 走査はミリ秒単位で、重いのは parse + bind + check。現状の tsc + typescript-eslint は型検査を実質 2 回行い(しかも tsc 側は native 7.x、ESLint 側は JS 6.x と別コンパイラ)、TS AST → ESTree 変換も挟む。単一化の勝ち筋は「1 つの `ts.Program` を型検査とルール検査で共有する」ことにある。
2. **この言語のルールの過半は型情報を要する**(宣言への null 禁止、boolean 厳密化、`no-unsafe-*`、readonly 強制…)。v1 では tsc の checker から逃げられない(自作は v3)。したがって専用ツールとは「tsc の Program に相乗りし、1 回の走査で全ルールを流す薄いプログラム」である。先行例: tsslint(TS language service 直載せの linter)。

## Phase 0: 仕様→強制手段の対応表 + 適合性コーパス(最初のステップ)

ツールより先に、エンジンを何にしても持ち越せる資産を作る。

- **対応表**([enforcement-map.md](./enforcement-map.md)): 仕様の全ルールについて「tsc オプション / 既存 ESLint ルール(正確なルール名と options)/ 新規実装が必要」「型情報の要否」を 1 行ずつ確定する。仕様と実装の契約であり、新規実装が必要な項目のリストが Phase 2 の作業量見積もりになる。
- **適合性コーパス**: ルールごとに valid / invalid のコード断片と期待診断を、**エンジン非依存のフィクスチャ形式**(ファイル + 期待診断)で蓄積する。Phase 1 の ESLint preset も Phase 2 の専用チェッカーも v3 も同じコーパスで検証する。エンジン乗り換え時の同値性ゲートを兼ねる。
- 完了条件: 仕様の `確定` 項目すべてが対応表に載り、「新規実装が必要」項目が列挙されていること。

## Phase 1: 既存インフラで dogfood(仕様の検証装置。最終形ではない)

- eslint-config-typed の組み合わせ + 固定 tsconfig([spec/compiler-options.md](./spec/compiler-options.md))で subset preset を組み、小さいパッケージ 1〜2 個に適用する。
- ここで焼き潰すリスクは性能ではなく**仕様の妥当性**(どのルールが実際に書き味を壊すか)。違反件数と体感の摩擦を対応表へフィードバックする。二重走査の遅さはこの規模では許容する。
- 完了条件: preset 適用パッケージが check green で稼働し、仕様側の手戻り(ルールの修正・緩和)が収束していること。

## Phase 2: 専用チェッカー `tsubu check`(仮)

TS API 上の薄い単一パスツール。parser も型検査器も書かない。

- **固定 compilerOptions をツールに内蔵**して `ts.Program` を 1 つ作る。ユーザーの tsconfig は不要になり、D-7「tsconfig は言語定義」がツールの形で実現される。tsc 診断をそのまま報告しつつ、SyntaxKind ごとに登録したルールコールバックへディスパッチする visitor を **1 回**流す。ESTree 変換なし・Program 共有・walk 1 回。
- **ルール API は `ts.Node` + checker を直接晒さず、薄い facade を挟む。** この縫い目が後の乗り換えを支える: (a) native コンパイラ(tsgo)の外部 API が安定したら下層を差し替えて「JS コンパイラでの二重型検査」を解消、(b) v3 の独自型検査器への置き換えでもルール層を保持。
- **エディタ統合を後回しにしない**(Flow の敗因 — [related-work.md](./related-work.md))。最初は CLI + TS language service plugin として出し、LSP を自作せずにエディタ診断を得る。watch モードは `ts.createWatchProgram` の incremental で。
- Phase 1 preset からルールを 1 個ずつ移植し、適合性コーパスで同値性をゲートしながら ESLint 側を退役させる。移植完了まで両者は並走してよい(コーパスが同値性を保証する)。言語仕様に属さないスタイル規則は ESLint に残してよい。
- 置き場所: `libs/` の新パッケージ(名称は言語名決定後)。
- 完了条件: 対応表の全項目が専用チェッカーで検査され、subset preset(言語仕様分)が退役していること。

## Phase 3(v2): fork parser はチェッカーと結合させずに足す

- v1 の具象構文は TS と同一なので v1 チェッカーに独自 parser は不要。v2 の CST 保存 parser([spec/future-syntax.md](./spec/future-syntax.md) の受け入れ条件)は、出力を「`ts.SourceFile` 相当 + ソースマップ」へ **lower してから** Phase 2 のルール層と emitter に渡す。チェッカーの書き直しは発生しない。
- 具象構文の互換性は「v2 構文 ⊃ v1 構文 = TS 構文」で構成的に保たれる。コストの重心(CST parser・高品質 emit)は v2 に置く。

## リスクと監視事項

- **tsgo(native TS)の外部 API**: Phase 2 を JS コンパイラ API で書く間、repo の type-check(native)と別に型検査が走る。facade の下層差し替えで解消する計画だが、native 側 API の成熟を追う。
- **ESLint にしか無い資産**: typescript-eslint の型付きルール実装(`no-unsafe-*` 等)は Phase 2 で自前移植になる。対応表で「移植コストが高い型付きルール」を洗い出し、移植順を決める。
- **仕様の変動**: Phase 2 着手は「Phase 1 で仕様の手戻りが収束してから」。着手が早すぎるとエンジン実装が仕様の揺れを直接被る。
