# TODO — Tsubu v1 実装の残タスク

生きたタスクリスト。段階の定義と設計は [implementation-plan.md](./implementation-plan.md)、ルールごとの実装手段は [enforcement-map.md](./enforcement-map.md) が正典で、このファイルは「今なにが残っているか」だけを持つ。完了した項目は消す。

## Phase 0(残り僅か)

- [ ] コーパス拡充の残り: 確定済みルールのうちフィクスチャ未整備分(整備状況の単一の真実は `languages/tsubu/conformance/src/rule-ids.mts` — 現在 22 ルール)。特に型情報が要るルール(`no-unsafe-*`、宣言への null 禁止、readonly 系)。`提案` は 2026-09-05 に一括確定(D-27)したので、その分のフィクスチャも書ける。
- [ ] JSX 系フィクスチャのための `.tsx` 対応(コーパスの構造規定は現在 `*.mts` のみ — [conformance-corpus.md](./conformance-corpus.md) の形式を拡張する)。

## Phase 1(v1 実装の本体)

- [ ] **🆕 新規ルールの実装**(preset に eslint-plugin として同梱、各 1 ルール): 宣言への null 型禁止(型情報)/ 境界 `?? undefined` 強制(型情報・最難)/ オーバーロード条件付き `function` 宣言許可 / コンストラクタ静的呼び出し禁止 / デコレータ禁止 / `<T,>` 強制(フォーマッタ互換は検証済み)/ 型空間の global 型 shadow 検査 / `castMutable` 乱用レポート / 論理代入 `&&=` `||=` の両オペランド boolean 限定(D-29 — `strict-boolean-expressions` の穴)。
- [ ] **preset 追補(2026-09-05 の確定分)** — `functional/no-try-statements` on(D-27)/ `import-x/no-unassigned-import` / `no-internal-modules` の allow リスト精査(D-27)/ getter・setter と `using` の `no-restricted-syntax` 選択子(D-30 / D-33)/ default export の `*.config.*` 例外撤回(D-28、アダプタファイルはファイル単位で除外 — D-36)/ `#` subpath imports が既存 import ルールで誤検出されないかの確認(D-28)。
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

- [ ] `as` キャストの嘘への対策(D-26 残課題): キャストの正しさをランタイム検証する言語機能、または ts-fortress のような validator ライブラリの使用強制(`as` が紛れ込みうるコード文脈を言語として限定する)の検討。型 refine で全域化した API(ts-std-forge、strict-ts-lib)の前提を守る仕組み。v3 候補。
- [ ] 型システムの残る不健全性のカタログ(`any` の伝播、配列共変性、型アサーション)— 型レベル機能は「TS の表現力維持」方針の下で健全性を損なう機能だけ洗い出す。
- [ ] numeric 型の安全化の続き([spec/future-syntax.md](./spec/future-syntax.md) 候補 7 / v3。`typeof` の narrowing 先を `Int` 等へ絞る機能を含む — 2026-09-05 追記)。
- [ ] `undefined` の排除(D-31): ts-std-forge の Optional ラッパー層が前提。v2 以降で `Optional<T>` へ一本化する規則を書く。
- [ ] default export を emit する v2 の設定ファイル / ディレクティブの設計(D-36)と、`using` の v2 での再検討(D-30)。
- [ ] barrel `export *` の扱い(2026-09-05 保留 — D-28)。
- [ ] 三層(制限 / 糖衣構文 / 型検査の変更 — D-37)の呼び名を決める(連番は間に層を挟むときに困る)。
- [ ] future-syntax.md の各候補に「v1 ライブラリ形」と両向きの codemod を明記する(D-37)。ライブラリ形の未整備分(パターンマッチ用 `match`、`?` 伝播用 `safeTry` 系)は ts-data-forge の並行ワークストリームへ。
- [ ] getter/setter の粒度の深掘り(plain object の遅延評価 — [spec/banned-syntax.md](./spec/banned-syntax.md))。
- [ ] 番兵値 API の棚卸し([throwing-stdlib-survey.md](./throwing-stdlib-survey.md) 次の調査枠)。

## ユーザー判断待ち

- (なし — 2026-09-05 に `提案` を一括解決: D-27〜D-36。残る `未定` はパイプ内 await / ts-pattern 採否 / `import.meta` / barrel `export *` で、いずれも v2 設計時まで保留)
