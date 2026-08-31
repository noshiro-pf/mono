# TODO — Tsubu v1 実装の残タスク

生きたタスクリスト。段階の定義と設計は [implementation-plan.md](./implementation-plan.md)、ルールごとの実装手段は [enforcement-map.md](./enforcement-map.md) が正典で、このファイルは「今なにが残っているか」だけを持つ。完了した項目は消す。

## Phase 0(残り僅か)

- [ ] コーパス拡充の残り: 確定済みルールのうちフィクスチャ未整備分(整備状況の単一の真実は `languages/tsubu/conformance/src/rule-ids.mts` — 現在 22 ルール)。特に型情報が要るルール(`no-unsafe-*`、宣言への null 禁止、readonly 系)と、`提案` 確定待ちの分。
- [ ] JSX 系フィクスチャのための `.tsx` 対応(コーパスの構造規定は現在 `*.mts` のみ — [conformance-corpus.md](./conformance-corpus.md) の形式を拡張する)。

## Phase 1(v1 実装の本体)

- [ ] **🆕 新規ルールの実装**(preset に eslint-plugin として同梱、各 1 ルール): 宣言への null 型禁止(型情報)/ 境界 `?? undefined` 強制(型情報・最難)/ オーバーロード条件付き `function` 宣言許可 / コンストラクタ静的呼び出し禁止 / デコレータ禁止 / `<T,>` 強制(フォーマッタ互換は検証済み)/ 型空間の global 型 shadow 検査 / `castMutable` 乱用レポート。
- [ ] **preset 追補(`提案` 確定後)** — `import-x/no-unassigned-import` / `no-internal-modules` の allow リスト精査(modules 仕様の確定待ち)、`functional/no-try-statements`(try..catch 禁止提案の確定待ち)。
- [ ] **readonly 強制の主課題** — `functional/prefer-immutable-types` / `type-declaration-immutability` の有効化実験(現行 config に TODO 付き下書き)。readonly-by-default 戦略(D-3)の成立条件。
- [ ] **コーパス runner のエンジン接続** — 中立 ID → ESLint ルール名のマッピングを実装し、フィクスチャで preset を検証(同値性ゲートの稼働開始)。
- [ ] **dogfood** — 第一対象 ts-std-forge(D-25)。違反件数と書き味を仕様へフィードバック。
- [ ] Phase 1 完了条件: 仕様の手戻りが収束していること([implementation-plan.md](./implementation-plan.md))。

## Phase 2 以降(着手条件: Phase 1 の収束)

- [ ] 専用チェッカー `tsubu check`(単一 `ts.Program`・単一 visitor・facade 経由のルール API)。
- [ ] v2: CST 保存 parser・独自構文(候補 1〜8 — [spec/future-syntax.md](./spec/future-syntax.md))。

## 並行ワークストリーム(v1 と独立)

- [ ] ts-std-forge: Tier 2(BigInt、`Iterator.take/drop`、`structuredClone`、toLocaleString 系)、Tier 3(TypedArray/DataView/Atomics、Intl)、Temporal family(D-23)。(Tier 1 は [#1725](https://github.com/noshiro-pf/mono/pull/1725) で完了)
- [ ] ts-std-forge: null / 番兵値 API の Optional ラッパー(棚卸しは [throwing-stdlib-survey.md](./throwing-stdlib-survey.md) の「次の調査枠」)。

## 仕様の未着手領域(フェーズ非依存)

- [ ] 型システムの残る不健全性のカタログ(`any` の伝播、配列共変性、型アサーション)— 型レベル機能は「TS の表現力維持」方針の下で健全性を損なう機能だけ洗い出す。
- [ ] numeric 型の安全化の続き([spec/future-syntax.md](./spec/future-syntax.md) 候補 7 / v3)。
- [ ] getter/setter の粒度の深掘り(plain object の遅延評価 — [spec/banned-syntax.md](./spec/banned-syntax.md))。
- [ ] 番兵値 API の棚卸し([throwing-stdlib-survey.md](./throwing-stdlib-survey.md) 次の調査枠)。

## ユーザー判断待ち

- [ ] 仕様の `提案` ステータスの承認(確認中): modules.md の import 形式・解決規則(`import * as ns` は現行ルールが「許可 + 非 tree-shakable 使用の禁止」なので追認が有力)/ exceptions.md の `try..catch` 禁止 / 論理代入演算子(`??=`)/ banned-syntax の「既存運用の昇格」節 / D-6(stdlib 二層)/ ユーザー変数 shadow の全面禁止(現行 config が既に禁止 — 追認提案)。
