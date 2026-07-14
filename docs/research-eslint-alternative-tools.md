# 高速 TypeScript Linter への移行適性 調査レポート

> 対象: `eslint-config-typed`（主要 ESLint プラグインの設定済み config + 独自カスタムルール実装を提供するライブラリ）
> 目的: ESLint の「flat config の優秀さ」「カスタムルール拡張性」を維持したまま高速化できる**完全上位互換**ツールへの移行可能性の評価
> 作成日: 2026-07-15

---

## 0. 結論（エグゼクティブサマリー）

**2026 年 7 月時点で「完全上位互換」と呼べる単一ツールは存在しない。** 決定打は本ライブラリの構成にある。

- 本ライブラリは 8 個の独自プラグイン・約 40 個のカスタムルールを持つが、**そのうち 22 ルールが型情報を使う type-aware ルール**（`getTypeChecker()` / `getParserServices()` を使用）。しかもこの type-aware 群こそがライブラリの核心的価値（`total-functions/*` の安全性ルール、`ts-data-forge/*` の推論ベース推奨ルール、`ts-restrictions/*`）である。
- **oxlint（＝Vite+ の linter）** は最有力候補で、ESLint 互換 JS プラグイン API・flat config 移行ツール・50〜100倍の速度を備え、**syntactic なカスタムルールは移植可能**。しかし **カスタム type-aware ルールは 2026-07 現在も未サポート**（明示された既知の制約）。→ 22 個の type-aware カスタムルールが今は移植不能。
- **rslint / tsslint / tsl** はカスタム type-aware ルールを書けるが、**既存 ESLint プラグインエコシステムをそのまま動かせない**（＝上位互換ではない）か、実験的段階。
- **VSCode DX を加味すると**: 22 個の type-aware カスタムルールは oxlint ではエディタでもフィードバックが出ない。逆に **tsl / tsslint は tsserver 内で動くため、その領域でむしろ現状 ESLint より優れたリアルタイム体験**を出せる。→ ハイブリッドの型担当は「tsl/tsslint 移植」が DX 上位（ただし移植工数は大）。詳細は §5。
- **TypeScript v7（tsgo）を見据えると結論が動く**: TS7 は tsserver プラグイン API（Strada）を引き継がないため **tsslint は TS7 で非互換（行き止まり）**、tsl も現状 JS の TS API 依存で tsgo 対応は未定。一方 **oxlint（type-aware = tsgolint）と rslint は typescript-go ネイティブ**。→ 型担当の将来の受け皿は「tsslint/tsl 移植」より **native-tsgo 側（oxlint の corsa / rslint）**が本命。詳細は §6。
- **flat config の運用上の利点（ファイル分割・glob・bulk suppressions）を軸に据えると**: **bulk suppressions（`eslint-suppressions.json`）を持つのは 2026-07 現在 ESLint だけ**（oxlint は Issue #10549 でロードマップ入りだが未実装）。また **rslint が ESLint v10 互換の flat config（TS の `defineConfig`）を採用**したことで、本ライブラリの型付き config 資産が最も自然に引き継げる移行先は rslint になった。詳細は §7。
- **「エディタが重い」問題への現実解**: ルール数の大半（syntactic 群）を oxlint LSP に退避すればエディタの ESLint 負荷は激減し、**oxlint は `oxc.configPath` でエディタ用/CLI 用の config を分離できる**。ESLint 側も v10.1 で bulk suppressions が IDE に反映されるようになった。詳細は §7。
- **ルール分類（用途ラベル・重複検出）の観点では、どのツールも本ライブラリの課題を解いていない**: 用途ラベルの本格実装は Biome domains のみ、構文ベースの重複検出は皆無。理想は「ルール = manifest 付きデータ、config = クエリ」で、まず **ESLint 上のメタレイヤ（本ライブラリの進化形）として実装するのが最短**。TS7 の type-aware ルール全書き直しは manifest 規約を業界標準に仕込める好機でもある。詳細は §8。

### 推奨方針

**「oxlint を主軸に据えた段階的ハイブリッド移行」** が現実解。

1. **今すぐ**: 大多数の rule（native 650+ ルール、非 type-aware なプラグイン、syntactic なカスタムルール）を oxlint に寄せて日常の lint を高速化。
2. **当面**: type-aware なカスタムルール（22個）と type-aware な typescript-eslint 系は、oxlint の組み込み type-aware（tsgolint）でカバーできる範囲は oxlint に任せ、**カバーできない独自 type-aware ルールだけ ESLint（または tsl）を CI/pre-commit で併走**させる。
3. **将来（要ウォッチ）**: oxlint のカスタム type-aware ルール API（`corsa-oxlint`、現在 early WIP）が実用化した時点で ESLint を完全撤去。ここが「完全上位互換」達成のトリガー。

> ⚠️ 見落としやすい点: 本ライブラリのもう一つの価値は **「flat config を型付きで書ける」config オーサリング層**（`defineConfig` / `RulesOptions` 型など）。oxlint の設定は `.oxlintrc.json`（JSON）であり、この型付き config 資産はそのままは移行しない。ライブラリのリブランド／再設計が必要になる。

---

## 1. 現状分析 — 本ライブラリが移行先に要求するもの

`src/` の実装から抽出した要件:

| 要件                                    | 実体                                                                                                                                                                                                     | 移行先での必須度            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 主要 ESLint プラグインの設定済み config | typescript-eslint, import, unicorn, react, react-hooks, jsx-a11y, promise, functional, security, n, jest/vitest, playwright/cypress, testing-library, stylistic 等 30+ の rule 集約（`src/rules/*.mts`） | ★★★                         |
| **syntactic カスタムルール**            | 約 18 ルール（`react-coding-style/*`, `tree-shakable/import-star`, `strict-dependencies`, `immer-coding-style`, `no-enums` 等）                                                                          | ★★★                         |
| **type-aware カスタムルール**           | **22 ルール**（下表）                                                                                                                                                                                    | ★★★（核心）                 |
| flat config の表現力                    | glob 単位の override、config 合成                                                                                                                                                                        | ★★★                         |
| 型付き config オーサリング              | `defineConfig`, `defineKnownRules`, `RulesOptions` 型                                                                                                                                                    | ★★（ライブラリ固有の価値）  |
| auto-fix / suggestion                   | 多くのカスタムルールが fixer 実装あり                                                                                                                                                                    | ★★                          |
| IDE 統合                                | VS Code                                                                                                                                                                                                  | ★★                          |
| **bulk suppressions（段階的導入）**     | 既存コードベースへ厳格ルールを一括導入し、既存エラーを suppressions ファイルに記録して段階的に解消（ESLint v9.24+ の `--suppress-all` / `eslint-suppressions.json`）                                     | ★★★（利用者側の導入現実性） |
| **エディタ負荷の分散**                  | 有効ルールが多くエディタが重い → 重いルールを CLI 専用 config に分離する運用が既にある。**エディタの即時エラー表示・auto-fix は維持したい**                                                              | ★★★（現在の実運用の痛点）   |

### 型情報に依存するカスタムルール（22個 = 移行の関門）

`total-functions`（10）: `no-hidden-type-assertions`, `no-nested-fp-ts-effects`, `no-partial-array-reduce`, `no-partial-division`, `no-partial-string-normalize`, `no-partial-url-constructor`, `no-premature-fp-ts-effects`, `no-unsafe-type-assertion`, `require-strict-mode`, `unsafe-assignment-rule`

`ts-data-forge`（8）: `no-unnecessary-type-guard`, `prefer-arr-is-array-at-least-length`, `prefer-arr-is-array-of-length`, `prefer-arr-is-non-empty`, `prefer-arr-sum`, `prefer-canonical-array-slicing`, `prefer-num-safe-parse-float`, `prefer-num-safe-parse-int`

`ts-restrictions`（4）: `check-destructuring-completeness`, `no-unnecessary-array-from`, `no-unnecessary-coalesce-undefined`, `prefer-non-mutating-array-method`

**この 22 ルールを移植できるかどうかが、各ツールの合否を分ける最重要基準。**

---

## 2. 評価軸

1. **ESLint プラグイン互換**（既存 config 群がそのまま動くか）
2. **syntactic カスタムルール**の記述可否
3. **type-aware カスタムルール**の記述可否 ← 最重要
4. **flat config 相当の設定表現力**
5. **速度**
6. **成熟度・後ろ盾・エコシステム**
7. 型付き config オーサリングの引き継ぎ
8. **VSCode 拡張の開発体験（DX）** — リアルタイム診断 / エディタでの type-aware / カスタムルール開発の反復ループ ← ルールライブラリでは特に重要
9. **TypeScript v7（tsgo / typescript-go）前方互換性** — 型情報エンジンが TS7 ネイティブか／将来動くか ← 型 lint の将来性に直結（詳細は §6）
10. **bulk suppressions ／ 段階的導入支援** — 既存コードベースに厳格ルールを適用しつつ既存エラーを記録・漸進解消できるか（詳細は §7）
11. **エディタ負荷の分散可能性** — エディタ用と CLI 用で config／ルールセットを分離でき、即時エラー表示と auto-fix を軽量に保てるか（詳細は §7）

---

## 3. 各ツール評価

### 3.1 oxlint（VoidZero / Oxc）＝ Vite+ の `vp check` / `vite lint` ── 最有力

**位置づけ**: Rust 製。650+ の native ルールを内蔵し、ESLint の 50〜100 倍高速。VoidZero（Evan You 率いる Vite の会社）が開発し、統合ツールチェーン **Vite+ に同梱**（`vp check` サブコマンド）。Framer / Linear / Atlassian / Shopify / Cloudflare 等が採用実績。

> Vite+ は当初（2025-10）有償ライセンスを予定していたが、**2026-03 の alpha で方針転換し MIT で完全 OSS 化**。収益源はデプロイ基盤「Void」に移した。したがって **oxlint / Vite+ にライセンス費用の懸念はない**。

| 軸                            | 評価        | 備考                                                                                                                                                                                                                                                                                 |
| ----------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ESLint プラグイン互換         | ◎           | **JS Plugins Alpha（2026-03）**。ESLint プラグイン API をほぼ全面実装（ESLint 本体の 33,006 テスト 100% pass）。既存プラグインは「ほぼ無改造で動く」。React hooks / Stylistic / Testing Library / SonarJS 等で検証済み。**「ESLint ユーザーの約 80% はそのまま乗り換え可能」**と公称 |
| syntactic カスタムルール      | ◎           | JS/TS でカスタムルールを記述可。AST traversal・scope・code path・fixer/suggestion・IDE 診断まで対応。ESLint とほぼ同一 API                                                                                                                                                           |
| **type-aware カスタムルール** | ✗（重大）   | **未サポート**。ただし typescript-eslint の type-aware ルールは native 実装で内蔵（tsgolint 経由、61 中 59 ルール対応）。実験的な `corsa-oxlint` で独自 type-aware プラグインを書く道はあるが **early WIP**                                                                          |
| flat config 表現力            | ○           | 設定は `.oxlintrc.json`。glob override・nested config（ディレクトリ単位）・`extends` 継承に対応し、**ファイル分割・合成は JSON なりに可能**。ただし **JS の flat config ではなく JSON**。`@oxlint/migrate` で eslint.config.js から自動移行                                          |
| **bulk suppressions**         | ✗（未実装） | **ESLint 式の suppressions ファイルは未対応**。要望 Issue #10549 が「Oxlint Q2」マイルストーンに載っているが 2026-07 現在未実装・担当者なし。現状は inline の disable コメントのみ                                                                                                   |
| エディタ/CLI の config 分離   | ○           | VSCode 拡張の `oxc.configPath` でエディタ専用 config を指せるため、**「エディタは軽い config・CLI はフル config」の分離運用が可能**（ただし LSP が configPath を無視する既知バグ報告 #21311 あり）                                                                                   |
| 速度                          | ◎           | ESLint 比 50〜100倍。type-aware も tsgolint（typescript-go 上）で「従来 1分 → 10秒未満」。カスタム JS ルールを 1 個入れると overhead が乗るが、それでも ESLint 比 7倍前後を維持                                                                                                      |
| 成熟度・後ろ盾                | ◎           | VoidZero が本体。Midjourney / Preact / PostHog で JS plugin が本番投入済み                                                                                                                                                                                                           |
| 型付き config 引き継ぎ        | △           | JSON 設定のため、本ライブラリの型付き `defineConfig` 資産は直接は活きない                                                                                                                                                                                                            |

**判定**: **完全上位互換ではないが、戦略的に最も近い。** 22 個の type-aware カスタムルール以外は今すぐ移行可能。type-aware カスタムルール API が実用化すれば「完全上位互換」に到達する最有力候補。**移行の主軸に据えるべき。**

**Windows 注意**: JS plugins 使用時に OOM 報告あり。WSL 推奨（本環境は WSL2 なので問題になりにくい）。

---

### 3.2 rslint（web-infra-dev / ByteDance、Rstack ファミリー）

**位置づけ**: typescript-go 製の ESLint 互換 linter。tsgolint（@auvred の PoC）の fork を継続開発。

| 軸                            | 評価 | 備考                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint プラグイン互換         | △〜○ | 「best effort ESLint compatible」。typescript-eslint / ESLint の**主要ルールは内蔵**。config の `plugins` にサードパーティ ESLint プラグインをマッピングして `<plugin>/<rule>` 名前空間で使う仕組みはあるが、**任意のプラグインがそのまま動く保証はなし**                                          |
| syntactic カスタムルール      | ○    | カスタムルール記述を掲げる                                                                                                                                                                                                                                                                         |
| **type-aware カスタムルール** | ○    | **AST・型情報・グローバル checker をカスタムルールに公開**（クロスモジュール解析可）。type-aware がデフォルト有効                                                                                                                                                                                  |
| **flat config**               | ◎    | **ESLint v10 互換の flat config を正式採用**。`rslint.config.ts` / `.mts` 等の **JS/TS 設定ファイル＋`defineConfig`** が推奨形式（JSON config は deprecated）。`files`/`ignores` glob、entry 合成・マージ、`languageOptions.parserOptions.projectService`、monorepo の nearest-config 探索まで対応 |
| bulk suppressions             | ✗    | suppressions ファイルの言及なし（ドキュメント上未対応）                                                                                                                                                                                                                                            |
| 速度                          | ◎    | 公称 ESLint 比 20〜40倍（未検証）                                                                                                                                                                                                                                                                  |
| 成熟度                        | ✗    | **experimental / pre-1.0**（v0.6.5、2026-07）。実運用は時期尚早                                                                                                                                                                                                                                    |

**判定**: **カスタム type-aware ルールを書ける点は本ライブラリと相性が良い**が、既存 ESLint プラグイン群をそのまま動かせる保証がない＝上位互換ではない。かつ実験段階。**要ウォッチだが今は非推奨。** oxlint の type-aware カスタム対応と競争関係にあり、動向を追う価値は高い。**特筆**: ESLint v10 互換 flat config（TS の `defineConfig`）の採用により、**本ライブラリの「型付き config オーサリング」資産（`defineConfig` / `RulesOptions` 型）を最も自然に引き継げる移行先**になった。oxlint（JSON 設定）に対する明確な優位点。

---

### 3.3 tsslint（johnsoncodehk / Volar 作者）

**位置づけ**: tsserver プラグインとして動く「最軽量の意味論 linter」。エディタが既に持つ TypeChecker を再利用し、二重型チェックを回避。**組み込みルールはゼロ**（全部自作前提）。

| 軸                        | 評価                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| ESLint プラグイン互換     | ✗（エコシステム非互換。上位互換ではない）                                                        |
| type-aware カスタムルール | ◎（rule = 関数。TS module / Program / SourceFile / report を受け取る。ディスクキャッシュで高速） |
| 速度                      | ◎（型チェックを二重に走らせない設計）                                                            |
| 成熟度                    | ○                                                                                                |

**判定**: **設計思想は本ライブラリの type-aware カスタムルールと極めて相性が良い**が、ESLint プラグイン資産を捨てることになる。単独移行先にはならない。ただし **「type-aware カスタムルールだけを高速に回す補助エンジン」**としては有力。⚠️ **ただし TypeScript v7（tsgo）とは非互換**（tsserver プラグイン方式に依存し、tsgo は Strada プラグイン API を持たない見込み）。TS7 移行を見据える限り、22 ルールの移植先としては将来性がない。詳細は §6。

---

### 3.4 tsl（ArnaudBarre）

**位置づけ**: `tsc` を拡張した type-aware linter。**oxlint / Biome のような「型を扱えず・カスタムルール API も無い高速 linter」と併用する前提**で設計されている（単独/ESLint 併用も可）。tsslint と歴史を共有。

**判定**: **oxlint とのハイブリッド構成の「型担当」として設計思想が完全に一致。** oxlint（高速な syntactic + 内蔵 type-aware）＋ tsl（独自 type-aware カスタムルール）という組み合わせは、本件の移行戦略の有力な受け皿。⚠️ **ただし TypeScript v7（tsgo）対応は未確定**。現状は JS の TS API（peer dep TS ≥5.8）に依存し、作者も「language service 統合を IPC でどう実現するか調査中／効率化には主要ルールの Go 移植が必要そう」と述べている。tsslint と違い自前で舵を切れる余地はあるが、tsl 移植を選ぶ場合は **tsl 自身の tsgo 対応がトリガー条件**になる。詳細は §6。

---

### 3.5 Biome（参考 — ユーザー既却下）

カスタムルールは GritQL ベースで、**任意の JS/TS カスタムルール（特に型情報を使うもの）を書けない**ため既に却下済み。v2「Biotype」で独自型推論エンジンを積んだが、**カスタム type-aware ルールを書く用途には応えない**。却下は妥当。

---

### 3.6 その他（対象外）

- **deno lint**: カスタムルール（型なし）は書けるが ESLint プラグイン非互換。上位互換でない。
- **quick-lint-js**: 設定・拡張性なし。対象外。
- **TSLint**: 2019 に非推奨。論外。

---

## 4. 比較表

| ツール             | ESLint プラグイン互換 | syntactic カスタム | **type-aware カスタム** |        flat config 相当        |  **bulk suppressions**   | 速度  | 成熟度 |             上位互換？              |
| ------------------ | :-------------------: | :----------------: | :---------------------: | :----------------------------: | :----------------------: | :---: | :----: | :---------------------------------: |
| **oxlint / Vite+** |           ◎           |         ◎          |      **✗（WIP）**       |            ○(JSON)             |     ✗（要望 #10549）     |   ◎   |   ◎    | **ほぼ（type-aware カスタム除く）** |
| rslint             |         △〜○          |         ○          |            ○            | ◎（ESLint v10 互換 TS config） |            ✗             |   ◎   |   ✗    |                  △                  |
| tsslint            |           ✗           |         ○          |            ◎            |               ✗                |            ✗             |   ◎   |   ○    |                  ✗                  |
| tsl                |       併用前提        |         ✗          |            ◎            |               ─                |            ✗             |   ◎   |   ○    |                補助                 |
| Biome              |           ✗           |      △(Grit)       |            ✗            |               ○                | △（inline 一括挿入のみ） |   ◎   |   ◎    |             ✗（却下済）             |
| ESLint（現状）     |           ◎           |         ◎          |            ◎            |               ◎                |   **◎（唯一の対応）**    | ✗遅い |   ◎    |                基準                 |

---

## 5. VSCode 拡張の開発体験（DX）評価

config/ルールライブラリの価値の中心は、CLI 速度だけでなく **「エディタでのリアルタイムフィードバック」と「カスタムルール開発の反復ループ」** にある。特に本ライブラリは型付き・カスタムルール志向なので、この軸は移行可否に直結する。

### DX 比較表

| ツール             | リアルタイム診断 | エディタでの type-aware（内蔵ルール） | **カスタムルールのエディタ反映** | auto-fix on save |  config 補完/検証   | 拡張の成熟度 |
| ------------------ | :--------------: | :-----------------------------------: | :------------------------------: | :--------------: | :-----------------: | :----------: |
| **oxlint / Vite+** |        ◎         |           △（alpha・bug有）           |  syntactic:◎ / **type-aware:✗**  |        ◎         | ○（oxlint設定のみ） |      ◎       |
| tsslint            |        ◎         |            ◎（tsserver内）            |         ◎（type-aware）          |        ◎         |          ○          |      ○       |
| tsl                |        ◎         |            ◎（tsserver内）            |         ◎（type-aware）          |        ○         |          ○          |      ○       |
| rslint             |        ○         |               ○（公称）               |            ○（公称）             |        ○         |          △          |      ✗       |
| Biome              |        ◎         |                   △                   |                ✗                 |        ◎         |          ◎          |      ◎       |
| ESLint（現状）     |        ◎         |        **✗ 遅い**（移行動機）         |        ◎（RuleTester等）         |  △ 大規模で重い  |          ◎          |      ◎       |

### 各ツールのエディタ DX 詳細

**oxlint（Oxc VSCode 拡張 `oxc.oxc-vscode`、9.6万+ installs）**

- `oxlint --lsp`（`oxc_language_server`）による LSP。リアルタイム診断・quick fix・`source.fixAll.oxc` の保存時 fix・マルチルート workspace 対応。`.oxlintrc.json` の **JSON schema 補完/検証あり**（ただし ESLint config は対象外）。
- エディタでの type-aware（内蔵ルール）: **対応（alpha）**。`oxc.typeAware=true` + `oxlint-tsgolint` 導入で有効化。ただし既知バグに注意 — **他ファイルの型変更が反映されない stale 診断**（Issue #19 / #20376）、monorepo で config 検出に失敗する報告あり。
- ⚠️ **本ライブラリにとって最重要**: カスタム type-aware ルールは非対応 → **22 個のカスタムルールはエディタ上でも一切フィードバックが出ない**。一方 syntactic なカスタム JS plugin ルールは LSP 経由でライブ表示され、反復ループは良好。
- カスタムルール開発 DX: JS plugin は alpha 段階。ESLint 互換 API なので RuleTester 的テストパターンは流用しやすいが、周辺ツールの成熟度は ESLint 未満。
- 公式が「CLI とエディタの診断は別物」と明記。ローカル devDependencies に oxlint が必要。

**tsslint / tsl（tsserver プラグイン方式）**

- **type-aware のエディタ DX は最良**。tsserver 内部に同居し、ネイティブ TS エラーと同じ経路で診断を返す → 二重型チェックなし・別プロセスなし・**stale が原理的に起きにくい**（エディタの Program を共有）。本ライブラリの 22 ルールにとって、これは **現状の ESLint より優れた**エディタ体験。
- `tsslint`: 専用 VSCode 拡張あり。`.vue` / `.mdx` / `.astro` 等も framework adapter 経由で対応。
- `tsl`: 単一の TS compiler plugin 方式（エディタ別拡張を作らない）。ただし VSCode で「TypeScript: Select TypeScript Version → Use Workspace Version」の選択が必要、かつ **エディタ統合には config ファイル（`tsl.config.ts`）が必須**という初期設定の一手間。
- カスタムルールは TS で `defineConfig` ベースに型安全に記述でき、本ライブラリの TS-first 思想と親和。ただし typescript-eslint API（`ESLintUtils` / `TSESTree`）からの**書き換えコストは大きい**（生 TS AST・別の report シグネチャ）。
- ESLint プラグインのエコシステムはエディタに出ない（oxlint 拡張と併用する前提）。

**rslint（web-infra-dev）**: 公式 VSCode 拡張で「リアルタイム診断・code action・保存時 auto-fix」を公称。LSP の明記はなし。ただし experimental / pre-1.0 で安定性リスク大。

**ESLint（基準）**: `vscode-eslint` は最も成熟し、`RuleTester`・AST explorer 等カスタムルール開発の周辺が最良。難点は**まさに移行動機そのもの** — エディタでの type-aware が遅く、大規模で Auto Fix on Save が重い。

### DX 観点での重要な示唆（結論の補強）

1. **22 個の type-aware カスタムルールについて、oxlint はエディタでもフィードバックゼロ。** つまり oxlint 単独では「エディタ DX がむしろ後退する領域」が生じる。
2. 一方 **tsl / tsslint はまさにその領域で現状（ESLint）を上回るエディタ DX** を提供できる。→ ハイブリッドの「型担当」は、ESLint 継続併走よりも **tsl / tsslint への移植**の方が、CLI 速度だけでなくエディタ体験でも上回る。
3. **エディタ内共存のきれいさ**: oxlint（独立 LSP）＋ tsl/tsslint（tsserver 内）は診断経路が分離し競合しない。対して oxlint ＋ ESLint は同一ルールの**二重報告ノイズ**が出やすい。→ DX 面でも「oxlint + tsl/tsslint」構成が「oxlint + ESLint」より優れる。
4. **トレードオフ**: ただし tsl/tsslint への 22 ルール移植は API 書き換え工数が大きい。ESLint 併走は書き換えゼロだがエディタ type-aware は遅いまま。**「エディタ DX を取るか、移行コストを取るか」**の意思決定になる。

---

## 6. TypeScript v7（tsgo / typescript-go）との相性評価

> TS 7 = TypeScript コンパイラの **Go ネイティブ移植（コードネーム Project Corsa）**。`tsgo`（`@typescript/native-preview`）として配布され、tsc 比 **7.5〜10 倍**の型チェック速度・大幅な低メモリ・**LSP 内蔵**（`tsgo --lsp`）。本ライブラリの 22 個の type-aware ルールは「型情報エンジン」に強く依存するため、**各ツールが tsgo の上で動くか／将来動けるか**は移行先選定の決定的な軸になる。

### tsgo が linter に与える構造的インパクト

- **最重要**: 従来の JS ベース Language Service / **tsserver プラグイン API（コードネーム Strada）は TS7 に引き継がれない**。tsgo 用の新しいプログラム API は設計中で、2026-07 現在も未完成。→ **「tsserver プラグイン方式で既存の TypeChecker を再利用する」設計のツールは TS7 で原理的に動かなくなる。**
- 逆に、**最初から typescript-go を直接叩くネイティブ Go 実装**（tsgolint / rslint）は、TS7 の恩恵（速度・低メモリ）を最も素直に受ける。tsgo は TS7 世代のアーキテクチャそのもの。
- ESLint / typescript-eslint 系は JS の TS API に依存し続けるため、**プロジェクトの `tsc` を tsgo に置き換えても、型 lint だけは当面「遅い JS 版 TS」を引きずる**構造になる。

### tsgo 相性 比較表

| ツール                              | tsgo との関係                                                                                           | TS7 対応状況                                                                                                                                                                |              相性              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------: |
| **oxlint（type-aware = tsgolint）** | type-aware エンジン **tsgolint が typescript-go 上に構築**。Rust の oxlint 本体が Go の tsgolint を呼ぶ | **すでに tsgo ネイティブ**（内蔵 type-aware は tsgo 上で動作。61 中 59 ルール対応）                                                                                         |        ◎ 前方互換の本命        |
| **rslint**                          | **本体が typescript-go 製**（tsgolint の fork、typescript-go を「コア」に据える）                       | **tsgo ネイティブ**。TS7 世代アーキテクチャそのもの                                                                                                                         |      ◎（ただし実験段階）       |
| **tsl**                             | 現状 `tsc`（JS の TS API、peer dep TS ≥5.8）に依存                                                      | **未対応**。作者は「language service 統合を IPC でどう実現するか調査中／効率化には主要ルールの Go 移植が必要そう」と明言                                                    |    △ 要ポーティング・不透明    |
| **tsslint**                         | **tsserver プラグイン方式**で動作                                                                       | **非互換**。tsgo は Strada プラグイン API を（おそらく恒久的に）持たない。作者自身が「tsgo はそのレベルのプラグイン対応をおそらく持たない」と発言                           |       ✗ TS7 で行き止まり       |
| **ESLint + typescript-eslint**      | JS の TS API 経由で型取得                                                                               | 対応作業中（Issue #10940、Project Service で下地）だが **stable は数ヶ月〜1〜2 メジャー先**。ESLint の async parser 非対応・tsgo の WASM async バインディング・直列化が障壁 | △ 近い将来は非ネイティブのまま |
| **Biome**                           | 独自型推論（Biotype）。TS コンパイラを使わない                                                          | tsgo 無関係（そもそも TS の型を使わない）                                                                                                                                   |          ─（却下済）           |

### 本ライブラリにとっての含意（重要 — §5 の結論を修正する）

1. **tsslint は TS7 で行き止まり。** §5 で「型担当の DX 最良」と評価した tsslint の魅力（tsserver 内で TypeChecker を共有）は、**まさにその tsserver プラグイン依存ゆえに TS7 で失われる**。tsgo 移行を見据えるなら、**22 ルールの移植先として tsslint を選ぶのは将来性の観点で不可**。ユーザー観測（tsslint 非互換）と一致する。
2. **tsl も無条件では選べない。** 現状は JS の TS API 依存で、tsgo 対応は作者も「調査中」。oxlint＋tsl ハイブリッドの「型担当」は、TS7 時代には **tsl 側の tsgo 対応が前提条件**になる。tsslint より自前で舵を切れる余地はある（Go 移植を検討中）が、時期は不透明。
3. **oxlint と rslint だけが「TS7 ネイティブ」。** oxlint の type-aware（tsgolint 経由）と rslint は typescript-go を直接使う。→ **TS7 の到来は oxlint 主軸戦略を強化し、type-aware カスタムルールの将来の受け皿を「tsslint/tsl 移植」から「oxlint のカスタム type-aware API（corsa-oxlint）／ rslint」へと傾ける。**
4. **ESLint 併走の隠れコスト。** 22 ルールを ESLint に残す案（§後述 Phase 2 の (a)）は書き換えゼロで安全だが、**プロジェクトが `tsc`→tsgo に移行しても型 lint だけは JS 版 TS を使い続ける**ため、「全体を native 化しても型 lint がボトルネックとして残る」構図になる点に注意。

### 推奨方針への反映

- **tsgo を前提に置くと、type-aware カスタム 22 ルールの受け皿から「tsslint 移植」は外すべき**（TS7 非互換）。
- 現実的な二択は **(a) 当面 ESLint 併走（型 lint は非ネイティブのまま許容）** か **(b) oxlint の corsa-oxlint / rslint の成熟を待って native-tsgo 側へ一気に寄せる**。DX 重視で tsl 移植を狙う場合も、**tsl 自身の tsgo 対応がトリガー条件**になる。
- 結論として、**「oxlint 主軸 ＋ ESLint を型 lint の当面の受け皿にしつつ、native-tsgo なカスタム type-aware（corsa-oxlint / rslint）の実用化を待つ」**のが、TS7 時代まで見据えた最も筋の良い経路。§5 の DX 評価だけなら tsslint/tsl が魅力的だったが、**tsgo 前方互換性を加味すると tsslint は脱落し、tsl は条件付きになる。**

---

## 7. flat config の利点・bulk suppressions・エディタ負荷分散の評価

> 利用者要件の再確認: 本ライブラリの利用形態は「提供される flat config を `eslint.config.mts` で import し、厳格過ぎる設定を off に上書きして使う」。ESLint flat config の **(1) ファイル分割・config 合成、(2) glob による適用対象定義の容易さ、(3) bulk suppressions による既存コードベースへの段階的導入** は手放したくない運用上の核心価値。加えて現場では **「有効ルールが多過ぎてエディタが重い → 重いルールを CLI 専用 config に分離」** という運用が既に発生しており、**エディタの即時エラー表示・auto-fix を保ったままの負荷分散**が現実の要求になっている。

### 7.1 bulk suppressions 対応状況（2026-07）

| ツール        | 対応                                                                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ESLint**    | **◎ 唯一の本格対応**。v9.24（2025-04）で `--suppress-all` / `--suppress-rule` → `eslint-suppressions.json` を導入。**v10.1（2026-03）で API（`applySuppressions`）にも開放され、IDE（vscode-eslint 等）が suppression を反映できる**ようになった |
| oxlint        | **✗ 未実装**。要望 Issue oxc#10549（2025-04 起票）が「Oxlint Q2」マイルストーンに載るが、2026-07 現在も担当者・実装 PR なし。現状は inline disable コメントのみ                                                                                  |
| rslint        | ✗ ドキュメント上言及なし                                                                                                                                                                                                                         |
| tsl / tsslint | ✗ inline ignore コメントのみ                                                                                                                                                                                                                     |
| Biome         | △ `--suppress` で `biome-ignore` コメントを**インラインに一括挿入**する方式（コードが汚れる）。ESLint 式の別ファイル管理は Discussion 段階                                                                                                       |

**含意**: 「厳格ルールを既存コードベースに入れて段階的に直す」というこのライブラリの推奨運用フローを支えられるのは、**現状 ESLint だけ**。→ **厳格な type-aware 群（このライブラリの核心 22 ルール＋typescript-eslint 厳格系）を ESLint に残す判断は、bulk suppressions の観点からも合理的**。逆に、oxlint に寄せる native / syntactic 群は「違反ゼロから運用開始できる基本ルール群」が中心なので、suppressions の必要性が相対的に低く、分担と噛み合う。oxlint の #10549 実装は Phase 3（完全移行）の追加トリガー条件として扱うべき。

### 7.2 flat config の合成力・ファイル分割の維持

- **ESLint（基準）**: ファイル分割・glob・型付き `defineConfig` すべて現状維持。
- **oxlint**: `.oxlintrc.json` ＋ nested config（ディレクトリ単位）＋ `extends` で分割・継承は可能だが、**JSON なので「TS でロジックを書いて config を合成する」自由度はない**。本ライブラリとしては「TS で書いた設定から `.oxlintrc.json` を生成する」ジェネレータ層を持てば利点をある程度温存できる（§9 のリブランド論とも整合）。
- **rslint**: **ESLint v10 互換 flat config を TS（`rslint.config.ts` + `defineConfig`）で採用**。`files`/`ignores` glob・entry 合成・projectService・monorepo nearest-config まで揃い、**「flat config の優秀さ」をほぼそのまま引き継げる唯一の代替ツール**。成熟すれば本ライブラリの提供形態（typed flat config の export）を最小変更で移せる。
- **tsl / tsslint**: 独自 config（`tsl.config.ts` 等）。TS で型安全に書ける点は良いが ESLint flat config とは別物。

### 7.3 「エディタが重い」問題への各構成の効き方

現状の痛点は「ルール数が多い ESLint がエディタ内で重く、即時性が落ちる／保存時 fix が遅い」。評価:

1. **oxlint 併用（推奨の主軸）**: ルール数の大半を占める syntactic 群（native 650+ 相当＋非 type-aware プラグイン群＋自作 syntactic 約18ルール）を oxlint LSP（Rust、独立プロセス）に移すと、**エディタ内の ESLint は「22 個の type-aware カスタム＋typescript-eslint 型系」だけの軽い config になり、即時エラー表示と保存時 auto-fix の体感が大きく改善**する。診断経路も oxlint LSP / vscode-eslint で分離され干渉しない。
2. **エディタ用と CLI 用の config 分離は両ツールとも可能**: ESLint は従来どおり config を分ければよい（このライブラリが「editor 用サブセット config」を export する設計も可能）。oxlint は VSCode 拡張の `oxc.configPath` でエディタ専用 config を指定できる（LSP が configPath を無視する既知バグ #21311 には注意）。
3. **oxlint 側の注意**: JS plugin ルールを保存時 fix に含めると CPU スパイクの報告（oxc-vscode #242、M4 Pro で 99%）。「native ルールのみ保存時 fix」のような粒度制御はまだ要望段階。→ **自作 syntactic ルールを oxlint JS plugin としてエディタでも回す場合は、保存時 fix の対象を絞る運用**が無難。
4. **bulk suppressions とエディタの整合**: ESLint v10.1 の `applySuppressions` API により、**suppress 済みの既存違反はエディタでも表示されない**運用が可能になった。「厳格ルール導入 → エディタが既存違反で真っ赤」という導入時の DX 問題が解消されている点は、ESLint 継続の追い風。

**結論（この軸）**: 「エディタの重さ」は移行の主目的である CLI 速度とは別の問題だが、**oxlint ハイブリッドはこの問題への直接的な解にもなる**（エディタ内 ESLint のルール数を 1/3 以下に削減）。逆に言えば、**完全移行を待たずとも Phase 1 の時点でエディタ体験の改善が得られる**。

---

## 8. ルール分類・メタデータ管理の設計思想比較 ＋「理想の TypeScript linter」考察

> 本ライブラリの内部実装が抱える構造的な課題からの問い: **ルールの「分類」は誰の責務か。** 現状の linter framework はこれを preset 作者の手作業に外部化しており、本ライブラリはまさにそのコストを払い続けている。

### 8.1 問題の定式化 — 本ライブラリの現状から

本ライブラリは用途別の事前定義 config（`nodejs` / `browser` / `react` / `preact` / `playwright` / `vitest` / `jest` / `cypress` / `testing-library` / `immer` …）を提供するが、その実体は**ルール名の手書きリスト**である。例えば `src/configs/nodejs.mts` は unicorn の DOM 系ルール約 30 個（`unicorn/prefer-dom-node-append`, `unicorn/no-document-cookie`, …）を**個別に列挙して off** にしている。型定義は `scripts/gen-eslint-rules` で plugin から自動生成されるのに対し、**「このルールはどの環境向けか」という分類だけは機械可読な情報源が存在せず、人手で維持するしかない**。

これにより発生しているコスト:

1. **分類の追従コスト**: 依存 plugin の更新で新ルールが増えるたび、「browser 専用か？ Node で意味があるか？ test 専用か？」を人が判定してリストに追記。漏れると「Node コードに DOM ルールが発火」等として顕在化する。
2. **重複ルールの管理コスト**: 同じ構文を検査するルールの重複（例: core `no-unused-vars` vs `@typescript-eslint/no-unused-vars`、core vs `unicorn` の同型ルール、stylistic 系 vs formatter）は、**片方を人が off にする**ことでしか解消できない。どのルール同士が重複しているかの機械可読な情報がない。

欠けている機構は 2 つに整理できる:

- **A. 用途ラベル機構** — 「このルールは browser 向け / Node 向け / React 向け / テストコード向け」というラベルをルール自身のメタデータとして持ち、config を「ラベルへのクエリ」として定義できること。
- **B. 検査対象構文による自動分類機構** — ルールが検査する AST ノード種別（＋型情報の要否）を機械的に取得でき、それに基づいて**重複・競合候補を自動検出**できること。

### 8.2 既存ツールのルール分類機構の比較

| ツール                 | 分類機構                                                                                                                     | A. 用途ラベル                                                                                                           | B. 構文による分類・重複検出                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **ESLint**             | rule `meta`（`type`: problem/suggestion/layout、`fixable`、`hasSuggestions`、`deprecated`/`replacedBy`、`docs.recommended`） | ✗ なし。「環境」は plugin の切り方と preset の手作業に外部化                                                            | ✗ なし（listener の introspection は技術的には可能 — 8.4 参照） |
| typescript-eslint      | `meta.docs.extendsBaseRule` — **base rule を置換する extension rule の機械可読宣言**                                         | ✗                                                                                                                       | △ 「置換関係」に限れば宣言あり（重複管理の最重要先行例）        |
| **Biome（v2）**        | groups（correctness/style/suspicious/…）＋ **domains（react / next / solid / test / project …）**                            | **◎ domains がまさに用途ラベル**。package.json の依存検出で該当 domain のルールを**自動有効化**、domain 固有 globals も | ✗                                                               |
| **oxlint**             | categories（correctness/suspicious/pedantic/perf/style/restriction/nursery）× plugin 名前空間（react/jest/unicorn/…）の 2 軸 | △ plugin 名前空間が疑似ラベル（react 系を一括 on/off は可能）。依存からの自動有効化はなし                               | ✗                                                               |
| deno lint              | tags（recommended / react / jsx / fresh …）                                                                                  | △ tag = 簡易ラベル                                                                                                      | ✗                                                               |
| rslint                 | presets（recommended 等）                                                                                                    | ✗（現状。ただし TS config なのでメタデータ層を載せる余地は大きい）                                                      | ✗                                                               |
| eslint-config-prettier | —（参考: formatter と競合する stylistic ルールの **手動メンテリスト**）                                                      | —                                                                                                                       | ✗ 重複管理が人手であることの象徴的存在                          |

**観察**:

- **A（用途ラベル）は Biome domains が唯一の本格実装**。「rule にラベルを持たせ、依存検出で自動適用」はユーザーの構想とほぼ同型で、**需要と実装可能性の実証例**になっている。ただし Biome はカスタムルール拡張性がない（§3.5）ため、本ライブラリの用途には接ぎ木できない。
- **B（構文による自動分類・重複検出）はどのツールも持たない**。全 linter が「ルール名という不透明な文字列」を config の単位にしており、ルールの中身（何を見るか）は実行するまで分からない。typescript-eslint の `extendsBaseRule` が「置換関係の宣言」という形で部分解を示しているのみ。
- つまりユーザーの構想する機構は**既存ツールの延長線上にありつつ、どこにも完全な形では存在しない**。

### 8.3 理想の TypeScript linter の設計スケッチ

コア思想: **「ルールはメタデータ（manifest）を持つデータであり、config はメタデータへのクエリである」**。ルール名の列挙（外延的定義）をやめ、述語による選択（内包的定義）に置き換える。

**(1) Rule Manifest — ルールが自己記述する**

```ts
export const rule = defineRule({
  name: 'prefer-dom-node-append',
  // A. 用途ラベル（多値）
  targets: ['browser'], // 'node' | 'browser' | 'universal' | 'deno' | ...
  frameworks: [], // 'react' | 'vue' | ... / テスト系: 'vitest' | 'playwright' | ...
  // B. 検査対象の宣言（検証可能 — (3) 参照）
  syntax: {
    nodes: ['CallExpression', 'MemberExpression'],
    typeInfo: 'none', // 'none' | 'checker' | 'cross-module'
  },
  // 重複・置換関係の宣言
  relations: {
    supersedes: [], // これを on にしたら自動 off にすべきルール
    overlapsWith: [], // 同一構文を検査する既知の隣接ルール（警告用）
  },
  fix: 'safe', // 'none' | 'safe' | 'unsafe'
  stability: 'stable', // 'nursery' | 'stable' | 'deprecated'
  profiles: { recommended: 'error', strict: 'error' },
  create: (ctx) => ({ ... }),
});
```

**(2) config はクエリ — 分類の追従コストが構造的に消える**

```ts
export default defineConfig([
    {
        files: ['src/**'],
        rules: query()
            .targets('node', 'universal') // browser 専用ルールは選択されない
            .stability('stable')
            .profile('strict'),
    },
    {
        files: ['**/*.test.mts'],
        rules: query().frameworks('vitest').profile('recommended'),
    },
]);
```

- plugin 更新で新ルールが来ても、**ラベルが付いていれば自動的に正しい preset に編入される**。preset 作者（＝本ライブラリ）の仕事は「リストの手書き追従」から「ラベルの監査」に変わる。
- 再現性は lockfile 的な **rule snapshot** で担保: クエリの解決結果を snapshot に固定し、`lint rules diff` が「今回の更新で strict preset に入る新ルール（ラベル付き）」を差分表示 → レビューして commit。**自動編入と明示的レビューの両立**。
- 環境の**自動検出**も Biome domains 式に可能: package.json の依存に加え、**tsconfig の `lib` に `DOM` が含まれるか**（browser/node 判定として最も信頼できる情報源）、`jsx` 設定、`engines` などから `targets` を推定してデフォルト適用。

**(3) メタデータの機械検証 — 自己申告を腐らせない**

ラベルは信頼できなければ意味がないので、framework が検証を担う:

- `syntax.nodes` は**実測で検証可能**: ルールの visitor 登録キーは introspection で取得でき（ESLint 互換 API なら `rule.create(proxyContext)` で listener キーを収集するだけ）、さらにルールの**テストフィクスチャ実行時に実際に報告が出たノード種別を記録**して宣言と突合できる。乖離があれば publish 時に CI で fail。
- `targets` の完全自動検証は不可能だが、ヒューリスティック（DOM API 名・`node:` import・グローバル参照の検出）で「browser ラベルなしに DOM API を検査しているルール」を警告する程度は機械化できる。

**(4) 重複・競合の自動検出 — 完全自動化はせず「候補検出は自動、確定は宣言」**

- config 解決時に、(a) `supersedes` 宣言からの**自動 off**（typescript-eslint の extension rule パターンの一般化 — `@ts/no-unused-vars` を on にすると core 側が自動で消える）、(b) **同一ノード集合に fixer を持つルールの組**を競合候補として警告（「A と B はどちらも `ArrowFunctionExpression` を書き換えます」）。
- 意味論レベルの重複（同じ意図を別構文で検査する）はノード集合の一致より深いので、完全自動判定は原理的に不可能。**検出は自動・解消は `supersedes`/`overlapsWith` 宣言**という二段構えが現実的な上限。

**(5) 実行アーキテクチャ — メタデータが負荷分散も駆動する**

`syntax.typeInfo` メタデータから、ルールは自動で実行 tier に振り分けられる:

- `none` → native/syntactic tier（エディタ LSP で常時実行）
- `checker` → 型 tier（tsgo 上、エディタでは on-demand / CLI では常時）
- `cross-module` → プロジェクト解析 tier（CI 中心）

§7.3 で論じた「エディタ用/CLI 用の config 手動分割」が、**メタデータ駆動で自動化**される。「エディタが重い」問題は config 運用ではなく framework の責務になる。

### 8.4 実現経路の比較 — 既存ツール拡張 vs 全ルール再実装

| 経路                                                 | 内容                                                                                         | 工数       | エコシステム互換     | 判定                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------- | -------------------- | ------------------------------ |
| **A. ESLint 上のメタレイヤ**（本ライブラリの進化形） | エンジン非改変。plugin を ingest してメタデータ registry を自前構築、クエリ→flat config 生成 | 小〜中     | ◎ 全 plugin そのまま | **短期の本命**                 |
| **B. 高速ツールへの上流貢献**                        | oxlint（corsa plugin API 設計中）/ rslint（TS config）に manifest 仕様を提案                 | 中（交渉） | ○                    | 中期。タイミングが今           |
| **C. フル再実装（理想の linter を作る）**            | エンジン＋全ルール書き直し                                                                   | 極大       | ✗ 全喪失から再構築   | 単独では非推奨（下記条件付き） |

**経路 A の具体像**（エンジン変更なしで今すぐ作れる）:

1. **syntax タグの自動収集**: 全依存 plugin のルールに対し `rule.create(proxy)` で visitor キーを実測 → 「ルール × AST ノード種別」の表を自動生成（`gen-eslint-rules` の自然な拡張）。
2. **重複候補レポート**: ノード集合の重なり＋ルール名の類似から重複候補を列挙 → `nodejs.mts` の手書き off リストの妥当性を機械チェック、新規重複の見落としを防止。
3. **targets ラベル DB**: 初回は既存の手書き off リスト（これ自体が人手分類の蓄積資産）から逆生成し、以後は**新規ルールだけ**判定する差分運用。DOM API 名等のヒューリスティックで下書きを自動生成。
4. **クエリ → flat config コンパイラ**: 既存の `defineConfig` / `defineKnownRules` 資産の上に載せる。利用者から見た提供物は今と同じ flat config。

弱点: メタデータが自前 DB に留まり上流に還元されない／実測できるのは syntax 面まで。それでも**課題 1（追従コスト）と課題 2（重複管理）の大部分はこの層で解消できる**。

**経路 C を選ぶ唯一の合理的な形**: ルール資産の規模感（ESLint core ~290 ＋ typescript-eslint ~130 ＋ 主要 plugin 群で 1000+。oxlint は 650 ルール移植に専業チームで数年、tsgolint は 59 ルールで大型 PoC）から、個人／小規模でのフル再実装は非現実的。**ただし §6 で見たとおり、TS7（tsgo）移行で type-aware ルールはエコシステム全体がどのみち書き直しを迫られる**。この「強制リセット」は、**新世代の rule API に manifest 義務化を最初から仕込める歴史的な窓**でもある。この窓に賭けるなら、作るべきは linter エンジンではなく **「rule manifest 仕様＋検証ツールチェーン」という共通規格**であり、それを oxlint（corsa）/ rslint / ESLint の各エンジンに採用提案する方が、再実装より遥かにレバレッジが高い。

### 8.5 本ライブラリへの示唆

- **短期**: 経路 A の (1)(2) は移行問題と独立に今すぐ着手でき、現行 ESLint 構成のメンテコストを直接下げる。§7 の「oxlintrc 生成器」「rslint 移行」とも**同じ資産（メタデータ registry ＋ config コンパイラ）で戦える** — どのエンジンに移行しても registry 層は生き残る。
- **中期**: corsa-oxlint の plugin API と rslint の config 仕様が固まる前の今が、manifest 的な機構を上流に提案する好機（Biome domains という実証例を援用できる）。
- **本ライブラリの将来形**は「typed flat config 集」から「**ルールメタデータ registry ＋ 任意エンジン向け config コンパイラ**」へ。これは §9 のリブランド論の具体的な中身になる。

---

## 9. 推奨移行戦略（段階的ハイブリッド）

### Phase 1 — oxlint 導入・共存（今すぐ着手可）

- `@oxlint/migrate` で既存 flat config を `.oxlintrc.json` へ変換。
- native 650+ ルール＋非 type-aware プラグイン＋ **syntactic カスタムルール（約18個）**を oxlint JS plugin として移植。
- typescript-eslint の type-aware ルールは oxlint の `--type-aware`（tsgolint、59/61 対応）に委譲。
- ESLint はまだ残し、**oxlint = 高速な日常 lint / エディタ、ESLint = フルチェック**の二段構え。
- **この時点でエディタ負荷問題が解消**（§7.3）: エディタ内の ESLint config を「type-aware カスタム 22＋型系」だけに絞り、残りは oxlint LSP へ。**「重いルールを CLI 送りにする」現行の分割運用を、「軽いルールを別ツール送りにする」構成に置き換える**イメージ。即時エラー表示・保存時 auto-fix は oxlint LSP / vscode-eslint の両方で維持される。

### Phase 2 — type-aware カスタムルールの受け皿を決定

- **22個の type-aware カスタムルール**をどう回すか:
    - (a) ESLint を CI/pre-commit で継続併走（**移行コスト最小・最も安全**。ただしエディタでの type-aware は遅いまま）、または
    - (b) **tsl / tsslint に移植**して ESLint を排除（型チェックの二重実行を避け高速化。**かつエディタ DX は現状より向上**。ただし API 書き換え工数が大きい）。
- **DX を重視するなら (b) が本命**: oxlint（独立 LSP）＋ tsl/tsslint（tsserver 内）はエディタ内で競合せず二重報告も出ない。oxlint＋ESLint 併走はエディタで二重報告ノイズが出やすい。
- ⚠️ **ただし TypeScript v7（tsgo）を見据えると (b) の選択肢は絞られる**（§6）: **tsslint は tsgo 非互換のため移植先から除外**。tsl も tsgo 対応が未定のため、tsl 移植は「tsl の tsgo 対応」を待つ条件付き。→ tsgo 前提では **(a) ESLint 併走で当面しのぎつつ、native-tsgo なカスタム type-aware（corsa-oxlint / rslint）の成熟を待つ**のが手堅い。
- **bulk suppressions の観点も (a) を後押しする**（§7.1）: 厳格な type-aware 群こそ既存コードベース導入時に suppressions が必要になる領域だが、これを持つのは現状 ESLint のみ（v10.1 で IDE 反映にも対応）。(b) の tsl / tsslint に移すと段階的導入の仕組みごと失う。
- oxlint の内蔵 type-aware で代替可能なもの（例: `no-unnecessary-type-guard` 相当）は oxlint 側に寄せて自作ルールを削減。

### Phase 3 — 完全移行（トリガー待ち）

- oxlint のカスタム type-aware ルール API（`corsa-oxlint`）が stable 化 → 22ルールを oxlint に移植 → **ESLint を完全撤去**。ここで初めて「単一ツールでの上位互換」達成。
- **完全撤去の追加条件**: ESLint を消すと bulk suppressions も一緒に失われるため、**oxlint の suppressions ファイル対応（oxc#10549、Q2 マイルストーン）の実装**もトリガー条件に含めるべき（§7.1）。
- 同時に **rslint** の成熟度も再評価（type-aware カスタムを最初からサポートし、**ESLint v10 互換 flat config を TS で書ける**ため、本ライブラリの提供形態を最も保てる受け皿。こちらが先に実用化する可能性もある）。

### ライブラリとしての `eslint-config-typed` の扱い

- 本ライブラリの資産は「rule 集約」だけでなく **型付き config オーサリング**（`defineConfig` / `RulesOptions` 型）にもある。oxlint は JSON 設定なので、この層は自動移行しない。
- 移行後は「**oxlint 用 preset（`.oxlintrc` 生成器）＋ カスタム JS plugin パッケージ**」への**リブランド／再設計**が必要。ライブラリの提供形態そのものが変わる点を要意思決定。

---

## 10. まとめ

- **「完全上位互換の単一ツール」は 2026-07 現在まだ無い。** 唯一の関門は本ライブラリの **22 個の type-aware カスタムルール**。
- **oxlint（Vite+）が最有力**。MIT で無償、ESLint プラグインをほぼ無改造で動かせ、syntactic カスタムルールも書け、速度は圧倒的。エディタ拡張も成熟（9.6万+ installs、LSP・保存時 fix・config 補完）。**唯一足りないのがカスタム type-aware ルール**で、これは公式ロードマップ上の WIP（`corsa-oxlint`）。
- **DX を加味すると結論が一段はっきりする**: 22 ルールは oxlint ではエディタ上でもフィードバックが出ない一方、**tsl / tsslint は tsserver 内で動くため、その領域で現状 ESLint を上回るリアルタイム体験**を出せる。よって「純粋な現在の DX」だけならハイブリッドの型担当は「ESLint 併走」より「tsl/tsslint への移植」が上位。
- **ただし TypeScript v7（tsgo）前方互換性を加味すると結論が動く（§6）**: TS7 は tsserver プラグイン API（Strada）を引き継がないため **tsslint は TS7 非互換（行き止まり）**、tsl も現状 JS の TS API 依存で tsgo 対応は未定。一方 **oxlint（type-aware = tsgolint）と rslint は typescript-go ネイティブ**。→ 将来まで見据えた型担当の受け皿は「tsslint/tsl 移植」ではなく **native-tsgo 側（corsa-oxlint / rslint）**が本命。
- 現実解は **oxlint 主軸 ＋ 当面 ESLint を型 lint の受け皿として併走**させて即座に大幅高速化し、**native-tsgo なカスタム type-aware（oxlint の corsa-oxlint / rslint）の実用化をトリガーに完全移行**するのが最善。DX 最優先で tsl 移植を狙う場合も、tsl 側の tsgo 対応が前提。
- **flat config・bulk suppressions・エディタ負荷の観点（§7）**: bulk suppressions を持つのは現状 **ESLint のみ**（v10.1 で IDE 反映まで対応）で、厳格 type-aware 群を ESLint に残す判断を後押しする。**エディタが重い問題は、Phase 1 の oxlint 併用時点で解消可能**（syntactic 群を oxlint LSP に退避し、エディタ内 ESLint を type-aware 中心の軽い config に絞る。`oxc.configPath` でエディタ/CLI の config 分離も可能）。
- **rslint** はカスタム type-aware を最初から狙い、**typescript-go ネイティブ**、かつ **ESLint v10 互換 flat config を TS（`defineConfig`）で書ける**点で、本ライブラリの提供形態（typed flat config）を最も保てる将来の受け皿。TS7 時代に本命化する可能性があり、oxlint と並行してウォッチ推奨。
- **ルール分類の設計思想（§8）**: 「ルールがどのコード向けか」のラベル機構は **Biome domains が唯一の本格実装**（依存検出で自動有効化）で、「検査対象構文による自動分類・重複検出」は**どのツールも持たない**。理想形は「**ルールは manifest を持つデータ、config はメタデータへのクエリ**」で、用途別 preset の追従コスト・重複ルール管理・エディタ負荷分散（typeInfo による tier 自動振り分け）が構造的に解消される。現実的な着手順は **(A) ESLint 上のメタレイヤ（visitor introspection による syntax タグ自動収集＋ラベル DB ＋クエリ→config コンパイラ）を本ライブラリの進化形として構築** → (B) corsa-oxlint / rslint の API が固まる前に manifest 仕様を上流提案。フル再実装は単独では非現実的だが、**TS7 による type-aware ルール全書き直しの「強制リセット」は manifest 義務化を新世代規約に仕込める歴史的な窓**。

---

## 参考リンク

- oxlint JS Plugins Alpha: <https://oxc.rs/blog/2026-03-11-oxlint-js-plugins-alpha.html>
- oxlint JS Plugins ガイド: <https://oxc.rs/docs/guide/usage/linter/js-plugins>
- oxlint Type-Aware Linting: <https://oxc.rs/docs/guide/usage/linter/type-aware.html>
- tsgolint（type-aware エンジン）: <https://github.com/oxc-project/tsgolint>
- Announcing Oxlint Type-Aware Linting（VoidZero）: <https://voidzero.dev/posts/announcing-oxlint-type-aware-linting>
- Announcing Vite+（VoidZero）: <https://voidzero.dev/posts/announcing-vite-plus>
- Announcing Vite+ Beta（MIT 化）: <https://voidzero.dev/posts/announcing-vite-plus-beta>
- Vite+ リポジトリ: <https://github.com/voidzero-dev/vite-plus>
- rslint: <https://github.com/web-infra-dev/rslint>
- tsslint: <https://github.com/johnsoncodehk/tsslint>
- tsl: <https://github.com/ArnaudBarre/tsl>
- 型付き linting 比較（Biome vs Oxlint）: <https://www.solberg.is/fast-type-aware-linting>
- Oxc VSCode 拡張（リポジトリ）: <https://github.com/oxc-project/oxc-vscode>
- Oxc VSCode 拡張（Marketplace）: <https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode>
- oxlint エディタ設定ガイド: <https://oxc.rs/docs/guide/usage/linter/editors>
- oxlint type-aware 診断の stale バグ（Issue）: <https://github.com/oxc-project/oxc-vscode/issues/19>
- TSSLint VSCode 拡張（Marketplace）: <https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-tsslint>
- TypeScript-Go（TS7 ネイティブ移植・Project Corsa）: <https://github.com/microsoft/typescript-go>
- typescript-eslint「tsgo で型情報を使う」Enhancement Issue #10940: <https://github.com/typescript-eslint/typescript-eslint/issues/10940>
- typescript-eslint/tsgolint（tsgo powered PoC）: <https://github.com/typescript-eslint/tsgolint>
- rslint（typescript-go 製の ESLint 互換 linter）: <https://github.com/web-infra-dev/rslint>
- Rslint 紹介記事（Socket）: <https://socket.dev/blog/rspack-introduces-rslint-a-typescript-first-linter-written-in-go>
- TSSLint 3.0（tsserver プラグイン方式・TS7 非互換の背景）: <https://www.infoq.com/news/2026/02/tsslint-3-release-final/>
- ESLint Bulk Suppressions（公式ドキュメント）: <https://eslint.org/docs/latest/use/suppressions>
- Introducing bulk suppressions（ESLint blog、v9.24）: <https://eslint.org/blog/2025/04/introducing-bulk-suppressions/>
- ESLint v10.1.0（bulk suppressions の API/IDE 対応）: <https://eslint.org/blog/2026/03/eslint-v10.1.0-released/>
- oxlint への suppressions ファイル要望（oxc Issue #10549、Q2 マイルストーン）: <https://github.com/oxc-project/oxc/issues/10549>
- oxlint 設定リファレンス（nested config / extends）: <https://oxc.rs/docs/guide/usage/linter/config>
- oxc-vscode「native ルールのみ保存時 fix」要望（CPU スパイク報告）: <https://github.com/oxc-project/oxc-vscode/issues/242>
- oxlint LSP が configPath を無視するバグ報告: <https://github.com/oxc-project/oxc/issues/21311>
- rslint Configuration（ESLint v10 互換 flat config・TS `defineConfig`）: <https://rslint.rs/config/>
- Biome の suppressions ファイル要望（Discussion #8691）: <https://github.com/biomejs/biome/discussions/8691>
- Biome Domains（用途ラベル＋依存検出による自動有効化）: <https://biomejs.dev/linter/domains/>
- ESLint カスタムルールの `meta` 仕様: <https://eslint.org/docs/latest/extend/custom-rules>
- typescript-eslint の extension rules（`extendsBaseRule`）: <https://typescript-eslint.io/rules/#extension-rules>
- eslint-config-prettier（formatter 競合ルールの手動メンテリスト）: <https://github.com/prettier/eslint-config-prettier>
- deno lint tags: <https://docs.deno.com/runtime/reference/cli/lint/>
